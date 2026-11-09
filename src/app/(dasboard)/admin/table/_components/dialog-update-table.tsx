"use client";

import { Dialog } from "@/components/ui/dialog";
import { INITIAL_STATE_TABLE } from "@/constants/table-constant";
import {
  Table,
  TableForm,
  tableFormSchema,
} from "@/validations/table-validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateTable } from "../actions";
import FormTable from "./form-table";

export default function DialogUpdateTable({
  refetch,
  currentData,
  open,
  handleChangeAction,
}: {
  refetch: () => void;
  currentData?: Table;
  open?: boolean;
  handleChangeAction?: (open: boolean) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  const form = useForm<TableForm>({
    resolver: zodResolver(tableFormSchema),
  });

  const [updateTableState, updateTableAction, isPendingUpdateTable] =
    useActionState(updateTable, INITIAL_STATE_TABLE);

  const onSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    formData.append("id", String(currentData?.id ?? ""));

    startTransition(() => {
      updateTableAction(formData);
    });
  });

  useEffect(() => {
    if (updateTableState?.status === "error") {
      toast.error("Update Table Failed", {
        description: updateTableState.errors?._form?.[0],
      });
    }

    if (updateTableState?.status === "success") {
      toast.success("Update Table Success");
      form.reset();
      handleChangeAction?.(false);
      refetch();
    }
  }, [updateTableState]);

  useEffect(() => {
    if (currentData) {
      form.setValue("name", currentData.name);
      form.setValue("description", currentData.description);
      form.setValue("capacity", currentData.capacity.toString());
      form.setValue("status", currentData.status);
    }
  }, [currentData]);

  return (
    <Dialog open={open} onOpenChange={(o) => handleChangeAction?.(o)}>
      <FormTable
        form={form}
        onSubmit={onSubmit}
        isLoading={isPendingUpdateTable}
        type="Update"
        closeRef={closeRef}
      />
    </Dialog>
  );
}
