"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ComboBuilder from "@/components/ComboBuilder";
import AuthToast from "@/components/AuthToast";
import { createClient } from "@/utils/supabase/client";
import { Combo } from "@/lib/types";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const supabase = createClient();
  const characterId = searchParams.get('character');

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      // Load the combo for editing
      const loadCombo = async () => {
        try {
          const { data } = await supabase
            .from("combos")
            .select("*")
            .eq("id", editId)
            .single();

          if (data) {
            setEditingCombo(data);
          }
        } catch (error) {
          console.error("Error loading combo:", error);
        }
      };
      loadCombo();
    } else {
      // Clear editing state when no edit parameter is present
      setEditingCombo(null);
    }
  }, [searchParams, supabase]);

  const handleBack = () => {
    // Check if we should return to a character page
    const returnTo = searchParams.get('returnTo');
    const characterSlug = searchParams.get('characterSlug');

    if (returnTo === 'character' && characterSlug) {
      router.push(`/c/${characterSlug}`);
    } else {
      router.back();
    }
  };

  const handleSave = () => {
    setEditingCombo(null);

    // Check if we should return to a character page
    const returnTo = searchParams.get('returnTo');
    const characterSlug = searchParams.get('characterSlug');

    if (returnTo === 'character' && characterSlug) {
      router.push(`/c/${characterSlug}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="space-y-6">
      {editingCombo && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="brutal-btn brutal-btn--secondary px-4 py-2 text-sm"
              aria-label="Go back"
            >
              ← BACK
            </button>
          </div>
        </div>
      )}

      <ComboBuilder
        characterId={characterId || undefined}
        editingCombo={editingCombo}
        onSave={handleSave}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <AuthToast />
      <HomeContent />
    </Suspense>
  );
}
