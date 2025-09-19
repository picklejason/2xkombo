"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ComboBuilder from "@/components/ComboBuilder";
import { createBrowserClient } from "@/lib/supabaseClient";
import { InputKey } from "@/components/InputIcon";

type Combo = {
  id: string;
  name: string;
  inputs: InputKey[];
  difficulty: string;
  tags: string[];
  character_id: string;
};

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const supabase = createBrowserClient();
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
    }
  }, [searchParams, supabase]);

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    setEditingCombo(null);
    router.push('/');
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
      <HomeContent />
    </Suspense>
  );
}
