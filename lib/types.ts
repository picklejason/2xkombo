import { InputKey } from "@/components/InputIcon";

export type Combo = {
  id: string;
  character_id: string;
  user_id: string;
  inputs: InputKey[];
  difficulty?: string | null;
  tags: string[];
  created_at: string;
  name?: string | null;
  completed?: boolean | null;
  damage?: number | null;
};
