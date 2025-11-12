import { supabase } from "./supabase";

export async function getText(key: string): Promise<string> {
  const { data } = await supabase.from("text_blocks").select("content_md").eq("key", key).maybeSingle();
  return data?.content_md ?? "";
}
