import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateFileType(file: File, types: string[]): boolean {
  return types.includes(file.type);
}

export function kebabCase(name: string): string {
  name.replace(/-|_/g, " ");

  let words = name.split(" ");

  words = words.map((word) => word.toLowerCase());

  return words.join("-");
}
