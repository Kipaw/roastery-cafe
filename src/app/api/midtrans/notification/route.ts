import { environment } from "@/config/environment";
import { createAdminClient } from "@/lib/supabase/admin";
import { createHash } from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { order_id, status_code, gross_amount, signature_key } = body;

  // verifikasi tanda tangan, supaya tidak bisa dipalsukan
  const expected = createHash("sha512")
    .update(
      `${order_id}${status_code}${gross_amount}${environment.MIDTRANS_SERVER_KEY}`,
    )
    .digest("hex");

  if (expected !== signature_key) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
  }

  const t = body.transaction_status;
  const fraud = body.fraud_status;

  let status: "settled" | "canceled" | null = null;
  if (t === "settlement" || (t === "capture" && fraud === "accept")) {
    status = "settled";
  } else if (["cancel", "deny", "expire"].includes(t)) {
    status = "canceled";
  }

  if (!status) return NextResponse.json({ ok: true }); // pending: abaikan

  const supabase = await createAdminClient();
  const now = new Date().toISOString();

  const { data: order, error } = await supabase
    .from("orders")
    .update({ status, updated_at: now })
    .eq("order_id", order_id)
    .select("table_id")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  if (order?.table_id) {
    await supabase
      .from("tables")
      .update({ status: "available", updated_at: now })
      .eq("id", order.table_id);
  }

  return NextResponse.json({ ok: true });
}
