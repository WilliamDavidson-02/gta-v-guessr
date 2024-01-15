import { ChangeEvent } from "react";

export function getImageData(ev: ChangeEvent<HTMLInputElement>) {
  // File is immutable, create a copy of it to format the name
  const image = ev.target.files![0];
  const timeStamp = new Date().getTime();
  const [name, type] = image.name.split(".");
  const newName = `${timeStamp}_${name}.${type}`;

  // Create a new File object with the new name
  const file = new File([image], newName, { type: image.type });

  const url = URL.createObjectURL(file);

  return { file, url };
}
