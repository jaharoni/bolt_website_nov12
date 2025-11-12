import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useTextBlock(key: string, defaultValue: string = ""): string {
  const [content, setContent] = useState(defaultValue);

  useEffect(() => {
    let alive = true;

    const fetchContent = async () => {
      const { data, error } = await supabase
        .from("text_blocks")
        .select("content_md")
        .eq("key", key)
        .maybeSingle();

      if (!error && data && alive) {
        setContent(data.content_md || defaultValue);
      } else if (alive) {
        setContent(defaultValue);
      }
    };

    fetchContent();

    return () => {
      alive = false;
    };
  }, [key, defaultValue]);

  return content;
}
