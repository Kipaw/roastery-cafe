"use client";

import DataTable from "@/components/ui/common/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { INITIAL_STATE_ACTION } from "@/constants/general-constant";
import { HEADER_TABLE_DETAIL_ORDER } from "@/constants/order-constant";
import useDataTable from "@/hooks/use-data-table";
import { createClient } from "@/lib/supabase/client";
import { cn, convertIDR } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { EllipsisVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { startTransition, useActionState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { updateStatusOrderitem } from "../../actions";
import Summary from "./summary";

type OrderMenuItem = {
  id: number;
  quantity: number | null;
  notes: string | null;
  status: string | null;
  menus: {
    id: number;
    name: string;
    image_url: string | null;
    price: number;
  } | null;
};

const STATUS_FLOW: Record<string, string> = {
  pending: "process",
  process: "ready",
  ready: "served",
};

export default function DetailOrder({ id }: { id: string }) {
  const supabase = createClient();
  const { currentPage, currentLimit, handleChangePage, handleChangeLimit } =
    useDataTable();

  const { data: order } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const result = await supabase
        .from("orders")
        .select("id, customer_name, status, payment_token, tables (name, id)")
        .eq("order_id", id)
        .single();

      if (result.error) {
        toast.error("Get Order data failed", {
          description: result.error.message,
        });
      }

      return result.data;
    },
    enabled: !!id,
  });

  const {
    data: orderMenu,
    isLoading: isLoadingOrderMenu,
    refetch: refetchOrderMenu,
  } = useQuery({
    queryKey: ["orders_menu", order?.id, currentPage, currentLimit],
    queryFn: async () => {
      const result = await supabase
        .from("orders_menus")
        .select("*, menus (id, name, image_url, price)", { count: "exact" })
        .eq("order_id", order!.id)
        .order("status");

      if (result.error) {
        toast.error("Get order menu data failed", {
          description: result.error.message,
        });
      }

      return result;
    },
    enabled: !!order?.id,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const [updateStatusOrderState, updateStatusOrderAction] = useActionState(
    updateStatusOrderitem,
    INITIAL_STATE_ACTION,
  );

  const handleUpdateStatusOrder = (data: { id: string; status: string }) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    startTransition(() => {
      updateStatusOrderAction(formData);
    });
  };

  useEffect(() => {
    if (updateStatusOrderState?.status === "error") {
      toast.error("Update Status Order Failed", {
        description: updateStatusOrderState.errors?._form?.[0],
      });
    }

    if (updateStatusOrderState?.status === "success") {
      toast.success("Update Status Order Success");
      refetchOrderMenu();
    }
  }, [updateStatusOrderState]);

  const filteredData = useMemo(() => {
    return ((orderMenu?.data || []) as unknown as OrderMenuItem[]).map(
      (item, index) => {
        const quantity = item.quantity ?? 0;
        const nextStatus = item.status ? STATUS_FLOW[item.status] : undefined;

        return [
          currentLimit * (currentPage - 1) + index + 1,
          <div key={`${item.id}-menu`} className="flex items-center gap-2">
            {item.menus?.image_url && (
              <Image
                src={item.menus.image_url}
                alt={item.menus.name}
                width={40}
                height={40}
                className="rounded"
              />
            )}
            <div className="flex flex-col">
              {item.menus?.name ?? "Menu deleted"} x {quantity}
              <span className="text-xs text-muted-foreground">
                {item.notes || "No Notes"}
              </span>
            </div>
          </div>,
          <div key={`${item.id}-price`}>
            {convertIDR((item.menus?.price ?? 0) * quantity)}
          </div>,
          <div
            key={`${item.id}-status`}
            className={cn(
              "w-fit rounded-full px-2 py-1 text-white capitalize",
              {
                "bg-gray-500": item.status === "pending",
                "bg-yellow-500": item.status === "process",
                "bg-blue-500": item.status === "ready",
                "bg-green-500": item.status === "served",
              },
            )}
          >
            {item.status}
          </div>,
          nextStatus ? (
            <DropdownMenu key={`${item.id}-action`}>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex size-8 text-muted-foreground data-[popup-open]:bg-muted"
                  />
                }
              >
                <EllipsisVertical />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  className="capitalize"
                  onClick={() =>
                    handleUpdateStatusOrder({
                      id: String(item.id),
                      status: nextStatus,
                    })
                  }
                >
                  {nextStatus}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            ""
          ),
        ];
      },
    );
  }, [orderMenu?.data, currentPage, currentLimit]);

  const totalPages = useMemo(() => {
    return orderMenu && orderMenu.count !== null
      ? Math.ceil(orderMenu.count / currentLimit)
      : 0;
  }, [orderMenu, currentLimit]);

  return (
    <div className="w-full space-y-4">
      <div className="flex w-full items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Detail Order</h1>
        <Button
          nativeButton={false}
          render={<Link href={`/order/${id}/add`} />}
        >
          Add Order Item
        </Button>
      </div>
      <div className="flex w-full flex-col gap-4 lg:flex-row">
        <div className="lg:w-2/3">
          <DataTable
            header={HEADER_TABLE_DETAIL_ORDER}
            data={filteredData}
            isLoading={isLoadingOrderMenu}
            totalPages={totalPages}
            currentPage={currentPage}
            currentLimit={currentLimit}
            onChangePage={handleChangePage}
            onChangeLimit={handleChangeLimit}
          />
        </div>
        <div className="lg:w-1/3">
          {order && (
            <Summary order={order} orderMenu={orderMenu?.data} id={id} />
          )}
        </div>
      </div>
    </div>
  );
}
