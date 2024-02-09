import useUserContext from "@/hooks/useUserContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ChangeEvent, DragEvent, useState } from "react";
import { cn, getImageUrl, kebabCase, validateFileType } from "@/lib/utils";
import { toast } from "sonner";
import supabase from "@/supabase/supabaseConfig";

const profileSchema = z.object({
  avatar_url: z.optional(z.instanceof(File)),
  username: z.string().min(3, "Username must be at least 3 characters."),
});

const acceptedFileTypes =
  "image/jpg, image/jpeg, image/png, image/svg, image/svg+xml";

export default function ProfileForm() {
  const { user, setUser } = useUserContext();
  const [isDragActive, setIsDragActive] = useState(false);
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      avatar_url: undefined,
      username: user?.user_metadata.username,
    },
  });

  const uploadAvatar = (file: File) => {
    const uploadPromise = new Promise(async (resolve, reject) => {
      if (!validateFileType(file, acceptedFileTypes.split(", "))) {
        reject("Invalid file type");
        return;
      }

      const fileName = `${new Date().getTime()}-${kebabCase(file.name)}`;

      //   Upload new avatar
      const upload = await supabase.storage
        .from("avatar")
        .upload(fileName, file);

      if (upload.error) {
        reject("Error uploading new avatar");
        return;
      }

      //   Get old avatar name to check if it is the default avatar
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user?.id)
        .single();

      if (error) {
        await supabase.storage.from("avatar").remove([fileName]);
        reject("Error retrieving old avatar file name");
        return;
      }

      const update = await supabase
        .from("profiles")
        .update({ avatar_url: fileName })
        .eq("id", user?.id);

      if (update.error) {
        await supabase.storage.from("avatar").remove([fileName]);
        reject("Error updating file name");
        return;
      }

      if (data.avatar_url !== "avatar-default.svg") {
        const { error } = await supabase.storage
          .from("avatar")
          .remove([data.avatar_url]);

        if (error) {
          reject("Error deleting old avatar");
          return;
        }
      }

      if (user) {
        const updatedUserContext = {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            avatar_url: getImageUrl("avatar", fileName),
          },
        };
        setUser(updatedUserContext);
      }

      resolve(null);
    });

    toast.promise(uploadPromise, {
      loading: "Uploading avatar",
      success: "Uploaded successfully",
      error: (error: string) => error,
    });
  };

  const handleImageChange = (ev: ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();

    if (ev.target.files && ev.target.files[0]) {
      const file = ev.target.files[0];
      uploadAvatar(file);
    }
  };

  const handleDrag = (ev: DragEvent<HTMLDivElement>) => {
    ev.preventDefault();

    if (ev.type === "dragenter" || ev.type === "dragover") {
      setIsDragActive(true);
    } else if (ev.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (ev: DragEvent<HTMLDivElement>) => {
    ev.preventDefault();

    if (ev.dataTransfer.files && ev.dataTransfer.files[0]) {
      const file = ev.dataTransfer.files[0];
      uploadAvatar(file);
      ev.dataTransfer.clearData();
    }

    setIsDragActive(false);
  };

  return (
    <Form {...form}>
      <form className="w-fit">
        <FormField
          control={form.control}
          name="avatar_url"
          render={({ field: { value, ...rest } }) => (
            <FormItem>
              <FormControl>
                <label htmlFor="avatar_url">
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Avatar
                      className={cn(
                        "h-64 w-64 cursor-pointer border-2 border-transparent transition-colors duration-300",
                        { "border-primary": isDragActive },
                      )}
                    >
                      <AvatarImage src={user?.user_metadata.avatar_url} />
                      <AvatarFallback className="text-7xl uppercase text-primary">
                        {user?.user_metadata.username.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      {...rest}
                      multiple={false}
                      onChange={handleImageChange}
                      accept={acceptedFileTypes}
                      id="avatar_url"
                      name="avatar_url"
                      type="file"
                      className="hidden"
                    />
                  </div>
                </label>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
