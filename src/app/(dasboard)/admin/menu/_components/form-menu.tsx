import FormImage from "@/components/ui/common/form-image";
import FormInput from "@/components/ui/common/form-input";
import FormSelect from "@/components/ui/common/form-select";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AVAILABILITY_LIST } from "@/constants/auth-constant";
import { CATEGORY_LIST } from "@/constants/menu-constant";
import { Preview } from "@/types/general";
import { Loader2 } from "lucide-react";
import { FormEvent, RefObject } from "react";
import {
  FieldValues,
  FormProvider,
  Path,
  UseFormReturn,
} from "react-hook-form";

export default function FormMenu<T extends FieldValues>({
  form,
  onSubmit,
  isLoading,
  type,
  preview,
  setPreview,
  closeRef,
}: {
  form: UseFormReturn<T>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  type: "Create" | "Update";
  preview?: Preview;
  setPreview?: (preview: Preview) => void;
  closeRef?: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <DialogContent className="max-h-[90vh] sm:max-w-[425px]">
      <FormProvider {...form}>
        <DialogHeader>
          <DialogTitle>{type} Menu</DialogTitle>
          <DialogDescription>
            {type === "Create" ? "Add a new menu" : "Make changes menu here"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="max-h-[50vh] space-y-4 overflow-y-auto px-1">
            <FormInput
              form={form}
              name={"name" as Path<T>}
              label="Name"
              placeholder="Insert name here"
            />
            <FormInput
              form={form}
              name={"description" as Path<T>}
              label="Description"
              placeholder="Insert description here"
              type="textarea"
            />
            <FormSelect
              form={form}
              name={"category" as Path<T>}
              label="Category"
              selectItem={CATEGORY_LIST}
            />
            <FormInput
              form={form}
              name={"price" as Path<T>}
              label="Price"
              placeholder="Insert price here"
              type="number"
            />
            <FormInput
              form={form}
              name={"discount" as Path<T>}
              label="Discount"
              placeholder="Insert discount here"
              type="number"
            />
            <FormImage
              form={form}
              name={"image_url" as Path<T>}
              label="Image"
              preview={preview}
              setPreview={setPreview}
            />
            <FormSelect
              form={form}
              name={"is_available" as Path<T>}
              label="Availability"
              selectItem={AVAILABILITY_LIST}
            />
          </div>
          <DialogFooter>
            <DialogClose
              render={<Button type="button" variant="outline" ref={closeRef} />}
            >
              Cancel
            </DialogClose>
            <Button type="submit">
              {isLoading ? <Loader2 className="animate-spin" /> : type}
            </Button>
          </DialogFooter>
        </form>
      </FormProvider>
    </DialogContent>
  );
}
