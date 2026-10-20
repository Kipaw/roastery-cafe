import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/ui/common/darkmode-toggle";
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <div>
      <Input></Input>
      <Button>Cek</Button>
      <DarkModeToggle />
    </div>
  );
}
