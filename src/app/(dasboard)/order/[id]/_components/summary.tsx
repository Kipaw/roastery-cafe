"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { INITIAL_STATE_GENERATE_PAYMENT } from "@/constants/order-constant";
import { usePricing } from "@/hooks/use-pricing";
import { convertIDR } from "@/lib/utils";
import { Menu } from "@/validations/menu-validation";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { generatePayment } from "../../actions";

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
          <h3 className="text-lg font-semibold">Order Summary</h3>
          <div className="flex items-center justify-between">
            <p className="text-sm">Subtotal</p>
            <p className="text-sm">{convertIDR(totalPrice)}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm">Tax (12%)</p>
            <p className="text-sm">{convertIDR(tax)}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm">Service (5%)</p>
            <p className="text-sm">{convertIDR(service)}</p>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">Total</p>
            <p className="text-lg font-semibold">{convertIDR(grandTotal)}</p>
          </div>
          {order?.status === "process" && (
            <Button
              type="button"
              onClick={handleGeneratePayment}
              disabled={!isAllServed || isPendingGeneratePayment}
              className="w-full cursor-pointer bg-teal-500 font-semibold text-white hover:bg-teal-600"
            >
              {isPendingGeneratePayment ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Pay"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
