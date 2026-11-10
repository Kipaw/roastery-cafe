"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { convertIDR } from "@/lib/utils";
import { Menu } from "@/validations/menu-validation";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";

export default function CardMenu({
  menu,
  onAddToCart,
}: {
  menu: Menu;
  onAddToCart: (menu: Menu, action: "increment" | "decrement") => void;
}) {
  return (
    <Card className="h-fit w-full gap-0 border p-0 shadow-sm">
      <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
        <Image
          src={menu.image_url as string}
          alt={menu.name}
          fill
          sizes="(min-width: 1024px) 20vw, 50vw"
          className="object-cover"
        />
      </div>
      <CardContent className="px-4 py-2">
        <h3 className="text-lg font-semibold">{menu.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {menu.description}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4">
        <div className="text-xl font-bold">{convertIDR(menu.price)}</div>
        <Button
          type="button"
          className="cursor-pointer"
          aria-label={`Add ${menu.name} to cart`}
          onClick={() => onAddToCart(menu, "increment")}
        >
          <ShoppingCart />
        </Button>
      </CardFooter>
    </Card>
  );
}
