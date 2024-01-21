import { useLocation } from "react-router-dom";
import { z } from "zod";
import { levels } from "./LocationForm";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

const singlePlayerSchema = z.object({
  level: z.enum(levels),
});

const multiPlayerSchema = z.object({
  level: z.enum(levels),
});

export default function GameCreation() {
  const pathname = useLocation().pathname.split("/")[1]; // remove "/" from pathname;
  const schema =
    pathname === "multiplayer" ? multiPlayerSchema : singlePlayerSchema;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Difficulty level</FormLabel>
              <FormControl>
                <RadioGroup
                  {...field}
                  name="level"
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex gap-4"
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
      </form>
    </Form>
  );
}
