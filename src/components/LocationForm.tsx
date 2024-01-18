import { Loader2, MapPin, Trash2, Upload } from "lucide-react";
import {
  ChangeEvent,
  Dispatch,
  DragEvent,
  SetStateAction,
  forwardRef,
  useEffect,
  useState,
} from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn, kebabCase, validateFileType } from "@/lib/utils";
import { toast } from "sonner";
import { UploadImage } from "./UploadImage";
import { ImageType, LocationType } from "@/pages/MapBuilder";
import { Toggle } from "./ui/toggle";
import { Cords } from "./Map";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import supabase from "@/supabase/supabaseConfig";

type LocationFormProps = Cords & {
  image: ImageType | null;
  setImage: Dispatch<SetStateAction<ImageType | null>>;
  pinMap: boolean;
  setPinMap: Dispatch<SetStateAction<boolean>>;
  className?: string | undefined;
  setLocations: Dispatch<SetStateAction<LocationType[]>>;
};

const levels: [string, ...string[]] = ["easy", "medium", "hard"];
const acceptedFiles = "image/jpeg, image/jpg, image/png";

const locationSchema = z.object({
  image: z
    .optional(z.instanceof(File))
    .refine((file) => file && file.size > 0, "Please upload an image"),
  lat: z.number({
    invalid_type_error: "Enter or select a latitude point for this location",
  }),
  lng: z.number({
    invalid_type_error: "Enter or select a longitude point for this location",
  }),
  level: z.enum(levels),
});

const LocationForm = forwardRef<HTMLInputElement, LocationFormProps>(
  (
    {
      image,
      setImage,
      pinMap,
      setPinMap,
      cords,
      setCords,
      className,
      setLocations,
      ...props
    },
    ref,
  ) => {
    const [isLoading, setIsLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const form = useForm<z.infer<typeof locationSchema>>({
      resolver: zodResolver(locationSchema),
      defaultValues: {
        image: undefined,
        lat: cords.lat,
        lng: cords.lng,
        level: "easy",
      },
    });

    useEffect(() => {
      form.setValue("lat", cords.lat);
      form.setValue("lng", cords.lng);
    }, [cords, setCords]);

    const handleLocationSubmit = async (
      values: z.infer<typeof locationSchema>,
    ) => {
      setIsLoading(true);
      console.log(values);
      if (!values.image) {
        toast.error("No image provided", {
          description: "Pleas provide an image for this location.",
        });
        setIsLoading(false);
        return;
      }

      const { data: bucket, error: bucketError } = await supabase.storage
        .from("image_views")
        .upload(
          `${new Date().getTime()}-${kebabCase(values.image.name)}`,
          values.image,
        );

      if (bucketError) {
        toast.error("Failed uploading image", {
          description: "Error while uploading image pleas try again.",
        });
        setIsLoading(false);
        return;
      }

      const { lat, lng, level } = values;

      const { data: location, error: locationError } = await supabase
        .from("locations")
        .insert({ lat, lng, image_path: bucket.path, level })
        .select();

      if (locationError) {
        toast.error("Failed saving location", {
          description: "Error while saving location, please try again.",
        });
        return;
      }

      setLocations((prev) => [...prev, location[0]]);
      setCords({ lat: 0, lng: 0 });
      setImage(null);
      setIsLoading(false);

      form.reset;
    };

    const processFile = (file: File) => {
      if (!validateFileType(file, acceptedFiles.split(", "))) {
        toast.error("Invalid file type", {
          description: "Only png, jpg and jpeg files are allowed.",
        });
        setDragActive(false);
        return;
      }

      // Create temporary blob url for preview
      const url = URL.createObjectURL(file);

      setImage({ file, url });
      form.setValue("image", file, { shouldValidate: true });
    };

    const handleImageChange = (ev: ChangeEvent<HTMLInputElement>) => {
      ev.preventDefault();
      if (ev.target.files && ev.target.files[0]) {
        const file = ev.target.files[0];
        processFile(file);
      }
    };

    const handleDrop = (ev: DragEvent<HTMLDivElement>) => {
      ev.preventDefault();

      if (ev.dataTransfer.files && ev.dataTransfer.files[0]) {
        const file = ev.dataTransfer.files[0];
        processFile(file);
        ev.dataTransfer.clearData();
      }

      setDragActive(false);
    };

    const handleDrag = (ev: DragEvent<HTMLFormElement | HTMLDivElement>) => {
      ev.preventDefault();

      const { type } = ev;

      if (type === "dragenter" || type === "dragover") {
        setDragActive(true);
      } else if (type === "dragleave") {
        setDragActive(false);
      }
    };

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleLocationSubmit)}
          className="flex h-full w-full flex-col justify-between p-4"
        >
          <div>
            <FormField
              control={form.control}
              name="image"
              render={({ field: { value, ...rest } }) => (
                <FormItem>
                  <FormControl>
                    <label
                      htmlFor="image"
                      className={cn(
                        "mx-auto flex aspect-video max-h-[700px] min-h-[400px] w-full overflow-hidden rounded-md border border-dashed border-border transition-colors duration-200",
                        { "bg-secondary": dragActive },
                        { "border-solid": image },
                      )}
                    >
                      <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={cn(
                          "flex w-full cursor-pointer select-none flex-col items-center justify-center gap-4 text-secondary",
                          { "text-primary": dragActive },
                        )}
                      >
                        {image ? (
                          <UploadImage className="h-full" src={image.url} />
                        ) : (
                          <>
                            <Upload size={40} />
                            <p className="text-clip text-nowrap text-sm">
                              Click to upload or drag and drop.
                            </p>
                          </>
                        )}
                        <input
                          {...props}
                          {...rest}
                          ref={ref}
                          multiple={false}
                          onChange={handleImageChange}
                          accept={acceptedFiles}
                          id="image"
                          name="image"
                          type="file"
                          className="hidden"
                        />
                      </div>
                    </label>
                  </FormControl>
                  {image && (
                    <div className="mt-4 flex w-full items-center gap-4 rounded-md border border-border bg-background p-2">
                      <div className="flex flex-grow items-center gap-4 text-sm">
                        <span>{image.file.name}</span>
                        <span>{(image.file.size / 1000).toFixed(0)}KB</span>
                      </div>
                      <Trash2
                        className="cursor-pointer select-none transition-colors hover:text-destructive"
                        onClick={() => {
                          setImage(null);
                          form.setValue("image", undefined, {
                            shouldValidate: true,
                          });
                        }}
                        size={20}
                      />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="my-4 grid min-w-[200px] grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="lat"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lng"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Toggle
                className="col-span-2"
                data-state={pinMap ? "on" : "off"}
                onClick={() => setPinMap((prev) => !prev)}
                variant="outline"
              >
                <MapPin />
              </Toggle>
            </div>
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty level</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={levels[0]}
                      className="flex flex-wrap gap-6"
                    >
                      {levels.map((level) => (
                        <div key={level} className="flex items-center gap-2">
                          <RadioGroupItem id={level} value={level} />
                          <Label htmlFor={level}>{level}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            className="w-full select-none"
            disabled={!form.formState.isValid}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <span>Submit</span>
            )}
          </Button>
        </form>
      </Form>
    );
  },
);

LocationForm.displayName = "LocationForm";

export { LocationForm };
