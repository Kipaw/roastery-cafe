"use client";

import DataTable from "@/components/ui/common/data-table";
import DropdownAction from "@/components/ui/common/dropdown-action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { HEADER_TABLE_TABLE } from "@/constants/table-constant";
import useDataTable from "@/hooks/use-data-table";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Table } from "@/validations/table-validation";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import DialogCreateTable from "./dialog-create-table";
import DialogDeleteTable from "./dialog-delete-table";
import DialogUpdateTable from "./dialog-update-table";

export default function TableManagement() {
  const supabase = createClient();
  const {
    currentPage,
    currentLimit,
    currentSearch,
    handleChangePage,
    handleChangeLimit,
    handleChangeSearch,
  } = useDataTable();

  const {
    data: tables,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["tables", currentPage, currentLimit, currentSearch],
    queryFn: async () => {
      const query = supabase
        .from("tables")
        .select("*", { count: "exact" })
        .range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
        .order("created_at");

      if (currentSearch) {
        query.or(
          `name.ilike.%${currentSearch}%,description.ilike.%${currentSearch}%,status.ilike.%${currentSearch}%`,
        );
      }

      const result = await query;

      if (result.error) {
        toast.error("Get Table data failed", {
          description: result.error.message,
        });
      }

      return result;
    },
  });

  const [selectedAction, setSelectedAction] = useState<{
    data: Table;
    type: "update" | "delete";
  } | null>(null);

  const handleChangeAction = (open: boolean) => {
    if (!open) setSelectedAction(null);
  };

  const filteredData = useMemo(() => {
    return (tables?.data || []).map((table: Table, index) => {
      return [
        currentLimit * (currentPage - 1) + index + 1,
        <div key={`${table.id}-name`}>
          <h4 className="font-bold">{table.name}</h4>
          <p className="text-xs">{table.description}</p>
        </div>,
        table.capacity,
        <div
          key={`${table.id}-status`}
          className={cn("w-fit rounded-full px-2 py-1 text-white capitalize", {
            "bg-green-600": table.status === "available",
            "bg-red-600": table.status === "unavailable",
            "bg-yellow-600": table.status === "reserved",
          })}
        >
          {table.status}
        </div>,
        <DropdownAction
          key={table.id}
          menu={[
            {
              label: (
                <span className="flex items-center gap-2">
                  <Pencil />
                  Edit
                </span>
              ),
              action: () => {
                setSelectedAction({ data: table, type: "update" });
              },
            },
            {
              label: (
                <span className="flex items-center gap-2">
                  <Trash2 className="text-red-400" />
                  Delete
                </span>
              ),
              variant: "destructive",
              action: () => {
                setSelectedAction({ data: table, type: "delete" });
              },
            },
          ]}
        />,
      ];
    });
  }, [tables, currentPage, currentLimit]);

  const totalPages = useMemo(() => {
    return tables && tables.count !== null
      ? Math.ceil(tables.count / currentLimit)
      : 0;
  }, [tables, currentLimit]);

  return (
    <div className="w-full">
      <div className="mb-4 flex w-full flex-col justify-between gap-2 lg:flex-row">
        <h1 className="text-2xl font-bold">Table Management</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search..."
            onChange={(e) => handleChangeSearch(e.target.value)}
          />
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>
              Create
            </DialogTrigger>
            <DialogCreateTable refetch={refetch} />
          </Dialog>
        </div>
      </div>
      <DataTable
        header={HEADER_TABLE_TABLE}
        data={filteredData}
        isLoading={isLoading}
        totalPages={totalPages}
        currentPage={currentPage}
        currentLimit={currentLimit}
        onChangePage={handleChangePage}
        onChangeLimit={handleChangeLimit}
      />
      <DialogUpdateTable
        open={selectedAction !== null && selectedAction.type === "update"}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
      />
      <DialogDeleteTable
        open={selectedAction !== null && selectedAction.type === "delete"}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
      />
    </div>
  );
}
