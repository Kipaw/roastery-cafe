"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/use-debounce";
import { convertIDR } from "@/lib/utils";
import { Cart } from "@/types/order";
import { Menu } from "@/validations/menu-validation";
import { Loader2, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useMemo } from "react";

function TearLine() {
  return (
    <div className="relative my-1">
      <div className="border-t-2 border-dashed border-border" />
      <span className="absolute -left-9 -top-3 size-6 rounded-full bg-background" />
      <span className="absolute -right-9 -top-3 size-6 rounded-full bg-background" />
    </div>
  );
}

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

  const subtotal = useMemo(
    () => carts.reduce((sum, item) => sum + item.total, 0),
    [carts],
  );

  const handleAddNote = (id: Menu["id"], notes: string) => {
    setCarts((prev) =>
      prev.map((item) => (item.menu_id === id ? { ...item, notes } : item)),
    );
  };

  return (
    <div className="sticky top-4 max-h-[calc(100svh-6rem)] w-full overflow-y-auto">
      <div className="relative w-full">
        <div className="relative space-y-4 rounded-t-2xl border border-b-0 bg-card px-6 pb-8 pt-6 shadow-sm">
          {/* header */}
          <div className="flex flex-col items-center gap-2 text-center">
            <Image
              src="/sinergy-logo.svg"
              alt="Sinergy Roastery"
              width={100}
              height={100}
              className="h-auto w-20"
            />
            <p className="text-[10px] tracking-[0.3em] text-muted-foreground">
              NEW ORDER
            </p>
          </div>

          <TearLine />

          {/* info customer */}
          {order && (
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">CUSTOMER</span>
                <span className="capitalize">{order.customer_name ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">TABLE</span>
                <span>{table?.name ?? "-"}</span>
              </div>
            </div>
          )}

          <div className="border-t border-dashed border-border" />

          {/* daftar item */}
          <div className="space-y-4">
            {carts.length > 0 ? (
              carts.map((item: Cart) => (
                <div key={item.menu.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Image
                        src={item.menu.image_url as string}
                        alt={item.menu.name}
                        width={32}
                        height={32}
                        className="size-8 rounded-md object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">{item.menu.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {convertIDR(item.total / item.quantity)}
                        </p>
                      </div>
                    </div>
                    <p className="font-mono text-sm">
                      {convertIDR(item.total)}
                    </p>
                  </div>

                  <div className="flex w-full items-center gap-3">
                    <Input
                      placeholder="Add note"
                      className="h-8 w-full text-xs"
                      defaultValue={item.notes}
                      onChange={(e) => {
                        const value = e.target.value;
                        debounce(() => handleAddNote(item.menu_id, value), 500);
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        aria-label={`Decrease ${item.menu.name}`}
                        className="size-8 cursor-pointer rounded-full"
                        onClick={() => onAddToCart(item.menu, "decrement")}
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-4 text-center font-mono text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        aria-label={`Increase ${item.menu.name}`}
                        className="size-8 cursor-pointer rounded-full"
                        onClick={() => onAddToCart(item.menu, "increment")}
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No item in cart
              </p>
            )}
          </div>

          <TearLine />

          {/* total */}
          <div className="flex items-center justify-between text-base font-bold">
            <span>SUBTOTAL</span>
            <span className="font-mono">{convertIDR(subtotal)}</span>
          </div>

          <Button
            type="button"
            size="lg"
            disabled={isLoading || carts.length === 0}
            onClick={() => onOrder()}
            className="w-full cursor-pointer rounded-full font-semibold"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Order"}
          </Button>

          {/* barcode dekoratif */}
          <div
            aria-hidden
            className="mx-auto mt-2 h-10 w-3/4 opacity-70"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, var(--foreground) 0 2px, transparent 2px 4px, var(--foreground) 4px 5px, transparent 5px 9px, var(--foreground) 9px 12px, transparent 12px 14px)",
            }}
          />
        </div>

        {/* tepi bergerigi di bawah */}
        <div
          aria-hidden
          className="h-3 w-full"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--card) 50%, transparent 50%), linear-gradient(225deg, var(--card) 50%, transparent 50%)",
            backgroundSize: "12px 12px",
            backgroundRepeat: "repeat-x",
          }}
        />
      </div>
    </div>
  );
}
