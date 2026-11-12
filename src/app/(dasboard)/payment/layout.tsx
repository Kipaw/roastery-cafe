import { DarkModeToggle } from "@/components/ui/common/darkmode-toggle";
import { ReactNode } from "react";

type PaymentLayoutProps = {
  children: ReactNode;
};

export default function PaymentLayout({ children }: PaymentLayoutProps) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="absolute right-4 top-4">
        <DarkModeToggle />
      </div>
      <div className="flex w-full max-w-2xl flex-col gap-6">{children}</div>
    </div>
  );
}
