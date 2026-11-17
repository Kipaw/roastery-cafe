import { Suspense } from "react";
import Success from "./_components/success";

export const metadata = {
  title: "Sinergy Roastery | Payment Success",
};

export default function SuccessPage() {
  return (
    <Suspense>
      <Success />
    </Suspense>
  );
}
