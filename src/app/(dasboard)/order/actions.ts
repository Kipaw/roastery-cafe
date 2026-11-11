"use server";

import { environment } from "@/config/environment";
import { createClient } from "@/lib/supabase/server";
import { FormState } from "@/types/general";
import { OrderFormState } from "@/types/order";
import { orderFormSchema } from "@/validations/order-validation";
import midtrans from "midtrans-client";

export async function createOrder(
  prevState: OrderFormState,
  formData: FormData,
) {
  const validatedFields = orderFormSchema.safeParse({
    customer_name: formData.get("customer_name"),
    table_id: formData.get("table_id"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      status: "error",
      errors: {
        ...validatedFields.error.flatten().fieldErrors,
        _form: [],
      },
    };
  }

  const supabase = await createClient();

  const orderId = `WPUCAFE-${Date.now()}`;
  const tableId = Number(validatedFields.data.table_id);

  const [orderResult, tableResult] = await Promise.all([
    supabase.from("orders").insert({
      order_id: orderId,
      customer_name: validatedFields.data.customer_name,
      table_id: tableId,
      status: validatedFields.data.status,
    }),
    supabase
      .from("tables")
      .update({
        status:
          validatedFields.data.status === "reserved"
            ? "reserved"
            : "unavailable",
        updated_at: new Date().toISOString(),
      })
      .eq("id", tableId),
  ]);

  const orderError = orderResult.error;
  const tableError = tableResult.error;

  if (orderError || tableError) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [
          ...(orderError ? [orderError.message] : []),
          ...(tableError ? [tableError.message] : []),
        ],
      },
    };
  }

  return { status: "success" };
}

export async function updateReservation(
  prevState: FormState,
  formData: FormData,
) {
  const supabase = await createClient();

  const status = formData.get("status") as string;
  const id = Number(formData.get("id"));
  const tableIdRaw = formData.get("table_id") as string;

  const [orderResult, tableResult] = await Promise.all([
    supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id),
    tableIdRaw
      ? supabase
          .from("tables")
          .update({
            status: status === "process" ? "unavailable" : "available",
            updated_at: new Date().toISOString(),
          })
          .eq("id", Number(tableIdRaw))
      : Promise.resolve({ error: null }),
  ]);

  const orderError = orderResult.error;
  const tableError = tableResult.error;

  if (orderError || tableError) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [
          ...(orderError ? [orderError.message] : []),
          ...(tableError ? [tableError.message] : []),
        ],
      },
    };
  }

  return { status: "success" };
}

export async function addOrderItem(
  prevState: OrderFormState,
  data: {
    order_id: string;
    items: {
      order_id: number;
      menu_id: number;
      quantity: number;
      notes: string;
      status: string;
    }[];
  },
) {
  const supabase = await createClient();

  const { error } = await supabase.from("orders_menus").insert(data.items);

  if (error) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  return { status: "success" };
}

export async function updateStatusOrderitem(
  prevState: FormState,
  formData: FormData,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders_menus")
    .update({
      status: formData.get("status") as string,
      updated_at: new Date().toISOString(),
    })
    .eq("id", Number(formData.get("id")));

  if (error) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  return { status: "success" };
}

export async function generatePayment(
  prevState: FormState,
  formData: FormData,
) {
  const supabase = await createClient();
  const orderId = formData.get("id") as string; // orders.order_id (text)
  const grossAmount = Math.round(Number(formData.get("gross_amount")));
  const customerName = formData.get("customer_name") as string;

  try {
    const snap = new midtrans.Snap({
      isProduction: false,
      serverKey: environment.MIDTRANS_SERVER_KEY,
    });

    const result = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: customerName,
      },
    });

    await supabase
      .from("orders")
      .update({
        payment_token: result.token,
        payment_url: result.redirect_url,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);

    return {
      status: "success",
      data: { payment_token: `${result.token}` },
    };
  } catch (e) {
    const message =
      (e as { ApiResponse?: { error_messages?: string[] } })?.ApiResponse
        ?.error_messages?.[0] ??
      (e as Error)?.message ??
      "Midtrans error";

    return {
      status: "error",
      errors: { ...prevState.errors, _form: [message] },
      data: { payment_token: "" },
    };
  }
}
