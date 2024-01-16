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

type LocationFormProps = {
  image: Image | null;
  setImage: Dispatch<SetStateAction<Image | null>>;
  className?: string | undefined;
};

const acceptedFiles = "image/jpeg, image/jpg, image/png";

const LocationForm = forwardRef<HTMLInputElement, LocationFormProps>(
  ({ image, setImage, className, ...props }, ref) => {
    const [dragActive, setDragActive] = useState(false);

    const handleSubmit = (ev: FormEvent) => {
      ev.preventDefault();
    };

    const processFile = (file: File) => {
      if (!validateFileType(file, acceptedFiles.split(", "))) {
        toast("Invalid file type", {
          description: "Only image files are allowed.",
        });
        setDragActive(false);
        return;
      }

      // Create temporary blob url for preview
      const url = URL.createObjectURL(file);

      setImage({ file, url });
    };

    const handleChange = (ev: ChangeEvent<HTMLInputElement>) => {
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
            {image ? (
              <>
                <div className="relative h-full w-full">
                  <div className="absolute bottom-0 flex w-full items-center gap-4 border border-transparent border-t-border bg-background p-2">
                    <div className="flex flex-grow items-center gap-4 text-sm">
                      <span>{image.file.name}</span>
                      <span>{(image.file.size / 1000).toFixed(0)}KB</span>
                    </div>
                    <Trash2
                      className="cursor-pointer transition-colors hover:text-destructive"
                      onClick={() => setImage(null)}
                      size={20}
                    />
                  </div>
                  <UploadImage src={image.url} />
                </div>
              </>
            ) : (
              <>
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
                  <Upload size={40} />
                  <p className="text-clip text-nowrap text-sm">
                    Click to upload or drag and drop.
                  </p>
                  <input
                    {...props}
                    ref={ref}
                    multiple={false}
                    onChange={handleChange}
                    accept={acceptedFiles}
                    id="dropzone-image"
                    name="dropzone-image"
                    type="file"
                    className="hidden"
                  />
                </div>
              </>
            )}
          </label>
          <div className="my-4 flex gap-2">
            <Input placeholder="Latitude" />
            <Input placeholder="Latitude" />
            <Button variant="outline">
              <MapPin />
            </Button>
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
