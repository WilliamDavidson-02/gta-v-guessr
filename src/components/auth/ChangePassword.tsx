import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import supabase from "@/supabase/supabaseConfig";
import { toast } from "sonner";

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

export default function ChangePassword() {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
    },
  });

  const submitNewPassword = async (values: z.infer<typeof passwordSchema>) => {
    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    form.resetField("password");
    toast.success("Updated profile to new password");
    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitNewPassword)}>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="col-span-10">
              <FormLabel>Change password</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Password" type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={!form.formState.isValid} className="mt-2 w-full">
          {isLoading ? (
            <Loader2 strokeWidth={1.8} className="animate-spin" />
          ) : (
            <KeyRound />
          )}
        </Button>
      </form>
    </Form>
  );
}
