import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { LatLng } from "@/pages/MapBuilder";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Button } from "./ui/button";
import { getImageData } from "@/lib/actions";

// Images
const MAX_IMAGE_SIZE = 5242880; // 5 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

const formSchema = z.object({
  latitude: z.number({
    invalid_type_error: "Pleas provide a number for latitude",
  }),
  longitude: z.number({
    invalid_type_error: "Pleas provide a number for longitude",
  }),
  panorama: z
    .custom<FileList>((val) => val instanceof FileList, "Required")
    .refine((files) => files.length > 0, `Required`)
    .refine(
      (files) => Array.from(files).every((file) => file.size <= MAX_IMAGE_SIZE),
      `Each file size should be less than 5 MB.`,
    )
    .refine(
      (files) =>
        Array.from(files).every((file) =>
          ALLOWED_IMAGE_TYPES.includes(file.type),
        ),
      "Only these types are allowed .jpg, .jpeg and .png",
    ),
});

type AdminLocationFormProps = {
  cords: LatLng;
  setCords: Dispatch<SetStateAction<LatLng>>;
  setPreviewUrl: Dispatch<SetStateAction<string>>;
};

export default function AdminLocationForm({
  cords,
  setCords,
  setPreviewUrl,
}: AdminLocationFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(formSchema),
    defaultValues: {
      latitude: 0,
      longitude: 0,
      panorama: undefined,
    },
  });

  useEffect(() => {
    form.setValue("latitude", cords.lat);
    form.setValue("longitude", cords.lng);
  }, [cords, setCords]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  return (
    <Form {...form}>
      <form className="p-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="latitude"
          render={({ field }) => (
            <FormItem className="grid grid-cols-3 grid-rows-2 items-center gap-x-2">
              <FormLabel className="col-span-1">Latitude</FormLabel>
              <FormControl className="col-span-2">
                <Input placeholder="Latitude" {...field} />
              </FormControl>
              <FormDescription className="col-span-3">
                Click any where on the map and latitude will be set.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="longitude"
          render={({ field }) => (
            <FormItem className="grid grid-cols-3 items-center gap-x-2">
              <FormLabel className="col-span-1">Longitude</FormLabel>
              <FormControl className="col-span-2">
                <Input placeholder="Longitude" {...field} />
              </FormControl>
              <FormDescription className="col-span-3">
                Click any where on the map and longitude will be set.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="panorama"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem className="grid grid-cols-3 items-center gap-x-2">
              <FormLabel className="col-span-1">panorama</FormLabel>
              <FormControl className="col-span-2">
                <Input
                  type="file"
                  accept="image/*"
                  multiple={false}
                  {...rest}
                  onChange={(ev) => {
                    const { file, url } = getImageData(ev);
                    setPreviewUrl(url);
                    onChange(file);
                  }}
                />
              </FormControl>
              <FormDescription className="col-span-3">
                Upload a panorama image
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="mt-4 w-full" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}
