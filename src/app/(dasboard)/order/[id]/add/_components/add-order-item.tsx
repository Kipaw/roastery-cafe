"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INITIAL_STATE_ACTION } from "@/constants/general-constant";
import { FILTER_MENU } from "@/constants/order-constant";
import useDataTable from "@/hooks/use-data-table";
import { createClient } from "@/lib/supabase/client";
import { Cart } from "@/types/order";
import { Menu } from "@/validations/menu-validation";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { addOrderItem } from "../../../actions";
import CardMenu from "./card-menu";
import CartSection from "./cart";
import LoadingCardMenu from "./loading-card-menu";

export default function AddOrderItem({ id }: { id: string }) {
  const supabase = createClient();
  const router = useRouter();
  const {
    currentSearch,
    currentFilter,
    handleChangeSearch,
    handleChangeFilter,
  } = useDataTable();

  const { data: menus, isLoading: isLoadingMenu } = useQuery({
    queryKey: ["menus-for-order", currentSearch, currentFilter],
    queryFn: async () => {
      const query = supabase
        .from("menus")
        .select("*", { count: "exact" })
        .order("created_at")
        .eq("is_available", true)
        .ilike("name", `%${currentSearch}%`);

      if (currentFilter) {
        query.eq("category", currentFilter);
      }

      const result = await query;

      if (result.error) {
        toast.error("Get Menu data failed", {
          description: result.error.message,
        });
      }

      return result;
    },
  });

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

  const [carts, setCarts] = useState<Cart[]>([]);

  const handleAddToCart = (menu: Menu, action: "increment" | "decrement") => {
    setCarts((prev) => {
      const existing = prev.find((item) => item.menu_id === menu.id);

      if (!existing) {
        if (action === "decrement") return prev;
        return [
          ...prev,
          { menu_id: menu.id, quantity: 1, total: menu.price, notes: "", menu },
        ];
      }

      if (action === "decrement") {
        if (existing.quantity <= 1) {
          return prev.filter((item) => item.menu_id !== menu.id);
        }
        return prev.map((item) =>
          item.menu_id === menu.id
            ? {
                ...item,
                quantity: item.quantity - 1,
                total: item.total - menu.price,
              }
            : item,
        );
      }

      return prev.map((item) =>
        item.menu_id === menu.id
          ? {
              ...item,
              quantity: item.quantity + 1,
              total: item.total + menu.price,
            }
          : item,
      );
    });
  };

  const [addOrderItemState, addOrderItemAction, isPendingAddOrderItem] =
    useActionState(addOrderItem, INITIAL_STATE_ACTION);

  const handleOrder = () => {
    if (!order?.id || carts.length === 0) return;

    const data = {
      order_id: id,
      items: carts.map((item) => ({
        order_id: order.id,
        menu_id: item.menu_id,
        quantity: item.quantity,
        notes: item.notes,
        status: "pending",
      })),
    };

    startTransition(() => {
      addOrderItemAction(data);
    });
  };

  useEffect(() => {
    if (addOrderItemState?.status === "error") {
      toast.error("Add Order Item Failed", {
        description: addOrderItemState.errors?._form?.[0],
      });
    }

    if (addOrderItemState?.status === "success") {
      toast.success("Add Order Item Success");
      setCarts([]);
      router.push(`/order/${id}`);
    }
  }, [addOrderItemState]);

  return (
    <div className="flex w-full flex-col gap-4 lg:flex-row">
      <div className="space-y-4 lg:w-2/3">
        <div className="flex w-full flex-col items-center justify-between gap-4 lg:flex-row">
          <div className="flex flex-col items-center gap-4 lg:flex-row">
            <h1 className="text-2xl font-bold">Menu</h1>
            <div className="flex gap-2">
              {FILTER_MENU.map((item) => (
                <Button
                  key={item.value}
                  onClick={() => handleChangeFilter(item.value)}
                  variant={currentFilter === item.value ? "default" : "outline"}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
          <Input
            placeholder="Search..."
            onChange={(e) => handleChangeSearch(e.target.value)}
          />
        </div>
        {isLoadingMenu && !menus ? (
          <LoadingCardMenu />
        ) : (
          <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3">
            {menus?.data?.map((menu) => (
              <CardMenu
                menu={menu}
                key={`menu-${menu.id}`}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
        {!isLoadingMenu && menus?.data?.length === 0 && (
          <div className="w-full text-center">Menu not found</div>
        )}
      </div>
      <div className="lg:w-1/3">
        <CartSection
          order={order}
          carts={carts}
          setCarts={setCarts}
          onAddToCart={handleAddToCart}
          isLoading={isPendingAddOrderItem}
          onOrder={handleOrder}
        />
      </div>
    </div>
  );
}
