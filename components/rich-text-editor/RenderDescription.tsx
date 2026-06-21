"use client";

import type { JSONContent } from "@tiptap/react";
import { useEffect, useState } from "react";
import parse from "html-react-parser";

export function RenderDescription({ json }: { json: JSONContent }) {
  const [output, setOutput] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [{ generateHTML }, extensionsModule] = await Promise.all([
          import("@tiptap/react"),
          import("./extensions"),
        ]);
        const extensions = extensionsModule.baseExtensions ?? [];
        const html = generateHTML(json as any, extensions as any);
        if (mounted) setOutput(html);
      } catch (err) {
        // fail gracefully on client
        // console.error(err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [json]);

  return (
    <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert prose-li:marker:text-primary">
      {parse(output)}
    </div>
  );
}
