import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateFileType(file: File, types: string[]): boolean {
  return types.includes(file.type);
}

export function kebabCase(name: string): string {
  let words = name.replace(/-|_/g, " ").split(" ");

  words = words.map((word) => word.toLowerCase());

  return words.join("-");
}

export async function createFileBlobFromUrl(url: string): Promise<File> {
  const splitUrl = url.split("/");
  const name = splitUrl[splitUrl.length - 1];

  const response = await fetch(url);
  const blob = await response.blob();

  const file = new File([blob], name, {
    type: response.headers.get("content-type") || "application/octet-stream",
  });

  return file;
}
