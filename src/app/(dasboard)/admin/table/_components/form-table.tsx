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
import { STATUS_TABLE_LIST } from "@/constants/table-constant";
import { Loader2 } from "lucide-react";
import { FormEvent, RefObject } from "react";
import {
  FieldValues,
  FormProvider,
  Path,
  UseFormReturn,
} from "react-hook-form";

export default function FormTable<T extends FieldValues>({
  form,
  onSubmit,
  isLoading,
  type,
  closeRef,
}: {
  form: UseFormReturn<T>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  type: "Create" | "Update";
  closeRef?: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <DialogContent className="max-h-[90vh] sm:max-w-[425px]">
      <FormProvider {...form}>
        <DialogHeader>
          <DialogTitle>{type} Table</DialogTitle>
          <DialogDescription>
            {type === "Create" ? "Add a new table" : "Make changes table here"}
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
            <FormInput
              form={form}
              name={"capacity" as Path<T>}
              label="Capacity"
              placeholder="Insert capacity here"
              type="number"
            />
            <FormSelect
              form={form}
              name={"status" as Path<T>}
              label="Status"
              selectItem={STATUS_TABLE_LIST}
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
