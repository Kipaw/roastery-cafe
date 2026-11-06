import { Controller, FieldValues, Path, UseFormReturn } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileImage } from "lucide-react";
import { getImageData } from "@/lib/utils";
import { Preview } from "@/types/general";

type FormImageProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  preview?: Preview;
  setPreview?: (preview: Preview) => void;
};

export default function FormImage<T extends FieldValues>({
  form,
  name,
  label,
  preview,
  setPreview,
}: FormImageProps<T>) {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <div className="flex items-center gap-2">
            <Avatar className="h-9 w-9 rounded-lg">
              <AvatarImage
                src={preview?.displayUrl}
                alt="preview"
                className="object-cover"
              />
              <AvatarFallback className="rounded-lg">
                <FileImage className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <Input
              id={name}
              type="file"
              accept="image/*"
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              disabled={field.disabled}
              aria-invalid={fieldState.invalid}
              onChange={(event) => {
                if (!event.target.files?.length) return;
                const { file, displayUrl } = getImageData(event);
                field.onChange(file);
                setPreview?.({ file, displayUrl });
              }}
            />
          </div>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
