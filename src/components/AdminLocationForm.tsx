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
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { getImageData } from "@/lib/actions";
import { Loader2 } from "lucide-react";
import supabase from "@/supabase/supabaseConfig";
import LocationView from "./LocationView";

const formSchema = z.object({
  latitude: z.number({
    invalid_type_error: "Pleas provide a number for latitude",
  }),
  longitude: z.number({
    invalid_type_error: "Pleas provide a number for longitude",
  }),
  image: z.instanceof(File).refine((file) => file.size > 0, {
    message: "Please upload a image for this location",
  }),
});

type AdminLocationFormProps = {
  cords: LatLng;
  setCords: Dispatch<SetStateAction<LatLng>>;
  previewUrl: string;
  setPreviewUrl: Dispatch<SetStateAction<string>>;
};

export default function AdminLocationForm({
  cords,
  setCords,
  previewUrl,
  setPreviewUrl,
}: AdminLocationFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(formSchema),
    defaultValues: {
      latitude: 0,
      longitude: 0,
      image: undefined,
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    form.setValue("latitude", cords.lat);
    form.setValue("longitude", cords.lng);
  }, [cords, setCords]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    const { latitude, longitude, image } = values;

    // Upload image to bucket
    const { error: storageError } = await supabase.storage
      .from("image_views")
      .upload(`/${image.name}`, image);

    // Add chadcn toast
    if (storageError) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("locations")
      .insert({ lat: latitude, lng: longitude, image_url: image.name })
      .select();

    // Add chadcn toast
    if (error) {
      console.log(error);
      setIsLoading(false);
      return;
    }

    console.log({ data, error });
    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4 p-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
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
          name="image"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem className="grid grid-cols-3 items-center gap-x-2">
              <FormLabel className="col-span-1">image</FormLabel>
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
                Upload an image
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <LocationView url={previewUrl} className="mx-auto max-h-[800px]" />
        <Button
          className="w-full"
          type="submit"
          disabled={isLoading || !form.formState.isValid}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
