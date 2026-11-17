"use client";

import { Button } from "@/components/ui/button";
import { INITIAL_STATE_GENERATE_PAYMENT } from "@/constants/order-constant";
import { usePricing } from "@/hooks/use-pricing";
import { convertIDR } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Menu } from "@/validations/menu-validation";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { generatePayment } from "../../actions";

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={
        strong
          ? "flex items-center justify-between text-base font-bold"
          : "flex items-center justify-between text-xs text-muted-foreground"
      }
    >
      <span>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function TearLine() {
  return (
    <div className="relative my-1">
      <div className="border-t-2 border-dashed border-border" />
      <span className="absolute -left-9 -top-3 size-6 rounded-full bg-background" />
      <span className="absolute -right-9 -top-3 size-6 rounded-full bg-background" />
    </div>
  );
}

export default function Summary({
  order,
  orderMenu,
  id,
}: {
  order: {
    customer_name: string | null;
    tables: unknown;
    status: string | null;
  };
  orderMenu:
    | { menus: Menu; quantity: number; status: string }[]
    | null
    | undefined;
  id: string;
}) {
  const router = useRouter();
  const { grandTotal, totalPrice, tax, service } = usePricing(orderMenu);
  const profile = useAuthStore((state) => state.profile);
  const table = order?.tables as { name: string } | null;

  const isAllServed = useMemo(() => {
    return (
      !!orderMenu &&
      orderMenu.length > 0 &&
      orderMenu.every((item) => item.status === "served")
    );
  }, [orderMenu]);

  const [
    generatePaymentState,
    generatePaymentAction,
    isPendingGeneratePayment,
  ] = useActionState(generatePayment, INITIAL_STATE_GENERATE_PAYMENT);

  const handleGeneratePayment = () => {
    const formData = new FormData();
    formData.append("id", id || "");
    formData.append("gross_amount", Math.round(grandTotal).toString());
    formData.append("customer_name", order?.customer_name || "");
    startTransition(() => {
      generatePaymentAction(formData);
    });
  };

  useEffect(() => {
    if (generatePaymentState?.status === "error") {
      toast.error("Generate Payment Failed", {
        description: generatePaymentState.errors?._form?.[0],
      });
    }

    if (
      generatePaymentState?.status === "success" &&
      generatePaymentState.data?.payment_token
    ) {
      window.snap.pay(generatePaymentState.data.payment_token, {
        onSuccess: () => router.push(`/payment/success?order_id=${id}`),
        onPending: () => router.push("/order"),
        onError: () => router.push("/payment/failed"),
        onClose: () => {},
      });
    }
  }, [generatePaymentState]);

  return (
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
            GOOD BEANS · BETTER DAYS
          </p>
        </div>

        <TearLine />

        {/* info order */}
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ORDER</span>
            <span className="max-w-40 truncate">{id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">CUSTOMER</span>
            <span className="capitalize">{order?.customer_name ?? "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">TABLE</span>
            <span>{table?.name ?? "-"}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-border" />

        {/* daftar item */}
        <div className="space-y-2 font-mono text-xs">
          {orderMenu && orderMenu.length > 0 ? (
            orderMenu.map((item, i) => (
              <div key={i} className="flex justify-between gap-2">
                <span className="truncate">
                  {item.quantity}x {item.menus?.name ?? "Menu deleted"}
                </span>
                <span>
                  {convertIDR((item.menus?.price ?? 0) * item.quantity)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">No items yet</p>
          )}
        </div>

        <div className="border-t border-dashed border-border" />

        {/* total */}
        <div className="space-y-2">
          <Row label="Subtotal" value={convertIDR(totalPrice)} />
          <Row label="Tax (12%)" value={convertIDR(tax)} />
          <Row label="Service (5%)" value={convertIDR(service)} />
        </div>

        <TearLine />

        <Row label="TOTAL" value={convertIDR(grandTotal)} strong />

        {order?.status === "process" && profile.role !== "kitchen" && (
          <Button
            type="button"
            size="lg"
            onClick={handleGeneratePayment}
            disabled={!isAllServed || isPendingGeneratePayment}
            className="w-full cursor-pointer rounded-full font-semibold"
          >
            {isPendingGeneratePayment ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Pay"
            )}
          </Button>
        )}

        {/* barcode dekoratif */}
        <div
          aria-hidden
          className="mx-auto mt-2 h-10 w-3/4 opacity-70"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, var(--foreground) 0 2px, transparent 2px 4px, var(--foreground) 4px 5px, transparent 5px 9px, var(--foreground) 9px 12px, transparent 12px 14px)",
          }}
        />
        <p className="text-center text-[10px] tracking-[0.3em] text-muted-foreground">
          THANK YOU
        </p>
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
  );
}
