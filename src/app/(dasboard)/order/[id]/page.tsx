import { environment } from "@/config/environment";
import Script from "next/script";
import DetailOrder from "./_components/detail-order";

export const metadata = {
  title: "WPU Cafe | Detail Order",
};

declare global {
  interface Window {
    snap: {
      pay: (token: string) => void;
    };
  }
}

export default async function DetailOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="w-full">
      <Script
        src={`${environment.MIDTRANS_API_URL}/snap/snap.js`}
        data-client-key={environment.MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      <DetailOrder id={id} />
    </div>
  );
}
