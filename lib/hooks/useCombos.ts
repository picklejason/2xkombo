import { useCallback, useMemo, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { Combo } from '@/lib/types';
import useSWR, { mutate } from 'swr';

type CombosResponse = {
  combos: Combo[];
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
};

const fetchCombos = async ({ userId, characterId }: { userId: string; characterId?: string }): Promise<Combo[]> => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 API CALL - fetchCombos called with userId:', userId, 'characterId:', characterId);
    console.log('⏰ Timestamp:', new Date().toISOString());
  }
  
  const supabase = createClient();
  
  let query = supabase
    .from("combos")
    .select("id, name, inputs, difficulty, damage, tags, character_id, completed")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (characterId) {
    query = query.eq("character_id", characterId);
  }

  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Failed to fetch combos: ${error.message}`);
  }
  
  return (data as Combo[]) || [];
};

export function useCombos(characterId?: string): CombosResponse {
  const { user, loading: authLoading } = useAuth();
  
  // Create a stable key for SWR
  const swrKey = useMemo(() => {
    if (authLoading || !user?.id) return null;
    return `combos-${user.id}-${characterId || 'all'}`;
  }, [user?.id, characterId, authLoading]);
  
  const { data: combos, error, isLoading, mutate: swrMutate } = useSWR(
    swrKey,
    () => fetchCombos({ userId: user!.id, characterId }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5 * 60 * 1000, // 5 minutes
      focusThrottleInterval: 30 * 1000, // 30 seconds
      onSuccess: (data) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ SWR Cache Updated - Key:', swrKey, 'Data Count:', data?.length || 0);
        }
      },
      onError: (err) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ SWR Error - Key:', swrKey, 'Error:', err);
        }
      }
    }
  );

  const mutateCombos = useCallback(() => {
    swrMutate();
  }, [swrMutate]);

  // Log cache status (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && swrKey) {
      console.log('📊 SWR Status - Key:', swrKey, {
        isLoading: isLoading,
        hasData: !!combos,
        dataCount: combos?.length || 0,
        hasError: !!error
      });
    }
  }, [swrKey, isLoading, combos, error]);

  return {
    combos: combos || [],
    isLoading: authLoading || isLoading,
    error,
    mutate: mutateCombos,
  };
}

// Utility functions for cache invalidation
export const invalidateCombosCache = (userId: string, characterId?: string) => {
  const key = `combos-${userId}-${characterId || 'all'}`;
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Cache Invalidation - Key:', key);
  }
  mutate(key);
  
  // Also invalidate the 'all' cache if we're invalidating a specific character
  if (characterId) {
    const allKey = `combos-${userId}-all`;
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Cache Invalidation (All) - Key:', allKey);
    }
    mutate(allKey);
  }
};

export const updateComboInCache = (userId: string, comboId: string, updates: Partial<Combo>, characterId?: string) => {
  const key = `combos-${userId}-${characterId || 'all'}`;
  if (process.env.NODE_ENV === 'development') {
    console.log('⚡ Optimistic Update - Key:', key, 'ComboId:', comboId, 'Updates:', updates);
  }
  mutate(key, (current: Combo[] | undefined) => {
    if (!current) return current;
    return current.map(combo => 
      combo.id === comboId ? { ...combo, ...updates } : combo
    );
  }, false);
};

export const removeComboFromCache = (userId: string, comboId: string, characterId?: string) => {
  const key = `combos-${userId}-${characterId || 'all'}`;
  if (process.env.NODE_ENV === 'development') {
    console.log('🗑️ Cache Removal - Key:', key, 'ComboId:', comboId);
  }
  mutate(key, (current: Combo[] | undefined) => {
    if (!current) return current;
    return current.filter(combo => combo.id !== comboId);
  }, false);
};
