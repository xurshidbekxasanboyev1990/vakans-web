import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base styles
        "resize-none flex field-sizing-content min-h-16 w-full rounded-md border px-3 py-2 text-base transition-[color,box-shadow] outline-none md:text-sm",
        // Colors - ensuring text is visible
        "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
        "border-gray-300 dark:border-gray-600",
        "placeholder:text-gray-500 dark:placeholder:text-gray-400",
        // Focus states
        "focus-visible:border-blue-500 focus-visible:ring-blue-500/30 focus-visible:ring-[3px]",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-700",
        // Error state
        "aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 aria-invalid:border-red-500",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
