import { MapPin, Trash2, Upload } from "lucide-react";
import {
  ChangeEvent,
  Dispatch,
  DragEvent,
  FormEvent,
  SetStateAction,
  forwardRef,
  useState,
} from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn, validateFileType } from "@/lib/utils";
import { toast } from "sonner";
import { UploadImage } from "./UploadImage";
import { Image } from "@/pages/MapBuilder";
import { Toggle } from "./ui/toggle";
import { Cords } from "./Map";

type LocationFormProps = Cords & {
  image: Image | null;
  setImage: Dispatch<SetStateAction<Image | null>>;
  pinMap: boolean;
  setPinMap: Dispatch<SetStateAction<boolean>>;
  className?: string | undefined;
};

const acceptedFiles = "image/jpeg, image/jpg, image/png";

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
      ...props
    },
    ref,
  ) => {
    const [dragActive, setDragActive] = useState(false);

    const handleSubmit = (ev: FormEvent) => {
      ev.preventDefault();
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
      <form
        onSubmit={handleSubmit}
        onDragEnter={handleDrag}
        className="flex h-full w-full flex-col justify-between p-4"
      >
        <div>
          <label
            htmlFor="dropzone-image"
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
                <UploadImage src={image.url} />
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
                ref={ref}
                multiple={false}
                onChange={handleImageChange}
                accept={acceptedFiles}
                id="dropzone-image"
                name="dropzone-image"
                type="file"
                className="hidden"
              />
            </div>
          </label>
          {image && (
            <div className="mt-4 flex w-full items-center gap-4 rounded-md border border-border bg-background p-2">
              <div className="flex flex-grow items-center gap-4 text-sm">
                <span>{image.file.name}</span>
                <span>{(image.file.size / 1000).toFixed(0)}KB</span>
              </div>
              <Trash2
                className="cursor-pointer select-none transition-colors hover:text-destructive"
                onClick={() => setImage(null)}
                size={20}
              />
            </div>
          )}
          <div className="my-4 flex gap-2">
            <Input
              value={cords.lat}
              onChange={(ev) =>
                setCords((prev) => ({
                  ...prev,
                  lat: parseFloat(ev.target.value),
                }))
              }
              placeholder="Latitude"
            />
            <Input
              value={cords.lng}
              onChange={(ev) =>
                setCords((prev) => ({
                  ...prev,
                  lng: parseFloat(ev.target.value),
                }))
              }
              placeholder="Longitude"
            />
            <Toggle
              data-state={pinMap ? "on" : "off"}
              onClick={() => setPinMap((prev) => !prev)}
              variant="outline"
            >
              <MapPin />
            </Toggle>
          </div>
        </div>
        <Button variant="outline" className="w-full">
          Submit
        </Button>
      </form>
    );
  },
);

LocationForm.displayName = "LocationForm";

export { LocationForm };
