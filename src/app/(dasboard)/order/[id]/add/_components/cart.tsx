"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import useDebounce from "@/hooks/use-debounce";
import { convertIDR } from "@/lib/utils";
import { Cart } from "@/types/order";
import { Menu } from "@/validations/menu-validation";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";

export default function CartSection({
  order,
  carts,
  setCarts,
  onAddToCart,
  isLoading,
  onOrder,
}: {
  order:
    | {
        customer_name: string | null;
        tables: unknown;
        status: string | null;
      }
    | undefined
    | null;
  carts: Cart[];
  setCarts: Dispatch<SetStateAction<Cart[]>>;
  onAddToCart: (item: Menu, type: "decrement" | "increment") => void;
  isLoading: boolean;
  onOrder: () => void;
}) {
  const debounce = useDebounce();
  const table = order?.tables as { name: string } | null | undefined;

  const handleAddNote = (id: Menu["id"], notes: string) => {
    setCarts((prev) =>
      prev.map((item) => (item.menu_id === id ? { ...item, notes } : item)),
    );
  };

  return (
    <Card className="w-full shadow-sm">
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold">Customer Information</h3>
        {order && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={order.customer_name ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Table</Label>
              <Input value={table?.name ?? "-"} disabled />
            </div>
          </div>
        )}
        <Separator />
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Cart</h3>
          {carts.length > 0 ? (
            carts.map((item: Cart) => (
              <div key={item.menu.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image
                      src={item.menu.image_url as string}
                      alt={item.menu.name}
                      width={30}
                      height={30}
                      className="rounded"
                    />
                    <div>
                      <p className="text-sm">{item.menu.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {convertIDR(item.total / item.quantity)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm">{convertIDR(item.total)}</p>
                </div>
                <div className="flex w-full items-center gap-4">
                  <Input
                    placeholder="Add Note"
                    className="w-full"
                    defaultValue={item.notes}
                    onChange={(e) => {
                      const value = e.target.value;
                      debounce(() => handleAddNote(item.menu_id, value), 500);
                    }}
                  />
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      aria-label={`Decrease ${item.menu.name}`}
                      className="cursor-pointer font-semibold"
                      variant="outline"
                      onClick={() => onAddToCart(item.menu, "decrement")}
                    >
                      -
                    </Button>
                    <p className="font-semibold">{item.quantity}</p>
                    <Button
                      type="button"
                      aria-label={`Increase ${item.menu.name}`}
                      className="cursor-pointer font-semibold"
                      variant="outline"
                      onClick={() => onAddToCart(item.menu, "increment")}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm">No item in cart</p>
          )}
          <Button
            type="button"
            disabled={isLoading || carts.length === 0}
            onClick={() => onOrder()}
            className="w-full cursor-pointer bg-teal-500 font-semibold text-white hover:bg-teal-600"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Order"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
