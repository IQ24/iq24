"use client";

import { isValidJSON } from "@iq24/invoice/content";
import { cn } from "@iq24i/cn";
import type { JSONContent } from "@tiptap/react";
import { useFormContext } from "react-hook-form";
import { Editor } from "./editor";

export function Description({
  className,
  name,
  ...props
}: React.ComponentProps<typeof Editor> & { name: string }) {
  const { watch, setValue } = useFormContext();
  const fieldValue = watch(name);

  const handleOnChange = (content?: JSONContent | null) => {
    const value = content ? JSON.stringify(content) : null;

    setValue(name, value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="relative">
      <Editor
        key={name}
        initialContent={
          isValidJSON(fieldValue) ? JSON.parse(fieldValue) : fieldValue
        }
        onChange={handleOnChange}
        className={cn(
          "border-0 p-0 min-h-6 border-b border-transparent focus:border-border font-mono text-xs pt-1",
          "transition-colors duration-200",
          className,
        )}
        {...props}
      />
    </div>
  );
}
