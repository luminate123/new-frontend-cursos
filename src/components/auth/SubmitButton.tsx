"use client";

import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export function SubmitButton({ isLoading, children }: SubmitButtonProps) {
  return (
    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20" disabled={isLoading}>
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Cargando...
        </span>
      ) : (
        children
      )}
    </Button>
  );
}