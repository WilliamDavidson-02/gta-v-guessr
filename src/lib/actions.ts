import { ChangeEvent } from "react";

export function getImageData(ev: ChangeEvent<HTMLInputElement>) {
  const dataTransfer = new DataTransfer();

  // Add image
  const image = ev.target.files![0];
  dataTransfer.items.add(image);

  const file = dataTransfer.files[0];
  const url = URL.createObjectURL(image);

  return { file, url };
}
