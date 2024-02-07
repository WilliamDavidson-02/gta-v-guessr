import { Users } from "@/hooks/useUsers";
import { LatLng } from "@/pages/MapBuilder";
import { User } from "@supabase/supabase-js";
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

export function isUserLeader(users: Users[], user: User | null): boolean {
  if (!users.length) return false;
  const time = (date: string) => new Date(date).getTime();

  const sort = users.sort((a, b) => time(a.joined_at) - time(b.joined_at));

  return sort[0].id === user?.id;
}

export function calculateArea(coordinates: number[][]) {
  /* 
  Calculating the area bu the shoelace formula.
  Dose not return an actual unit of measurement, instead a representation of the areas
  scale to be used as a modifier in the point system.
  */

  let area = 0;
  for (let i = 0; i < coordinates.length; i++) {
    let j = (i + 1) % coordinates.length; // j is 1 index ahead of i
    area += coordinates[i][0] * coordinates[j][1];
    area -= coordinates[j][0] * coordinates[i][1];
  }

  return Math.floor(Math.abs(area / 2));
}

export function calcDistance(cords: LatLng, location: LatLng): number {
  const diffLng = cords.lng - location.lng;
  const diffLat = cords.lat - location.lat;
  const distance = Math.floor(Math.sqrt(diffLng * diffLng + diffLat * diffLat));

  return distance;
}
