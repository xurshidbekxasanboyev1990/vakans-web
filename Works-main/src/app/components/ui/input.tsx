import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base transition-[color,box-shadow] outline-none md:text-sm",
        // Colors - ensuring text is ALWAYS visible (black text on white bg)
        "bg-white dark:bg-gray-800",
        "text-gray-900 dark:text-white",
        "border-gray-300 dark:border-gray-600",
        "placeholder:text-gray-500 dark:placeholder:text-gray-400",
        // Focus states - keep text dark
        "focus:bg-white dark:focus:bg-gray-800",
        "focus:text-gray-900 dark:focus:text-white",
        "focus-visible:border-blue-500 focus-visible:ring-blue-500/30 focus-visible:ring-[3px]",
        // Autofill fix - prevents browser from changing background
        "[&:-webkit-autofill]:bg-white [&:-webkit-autofill]:text-gray-900",
        "[&:-webkit-autofill]:[-webkit-text-fill-color:theme(colors.gray.900)]",
        "[&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_white_inset]",
        "dark:[&:-webkit-autofill]:[-webkit-text-fill-color:theme(colors.white)]",
        "dark:[&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_theme(colors.gray.800)_inset]",
        // File input
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        // Selection
        "selection:bg-blue-500 selection:text-white",
        // Disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-700",
        // Error state
        "aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 aria-invalid:border-red-500",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
