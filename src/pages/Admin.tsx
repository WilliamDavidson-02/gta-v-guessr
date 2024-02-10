import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HardHat, Menu } from "lucide-react";
import { useState } from "react";
import { Link, Outlet } from "react-router-dom";

export default function Admin() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <section className="flex h-[calc(100vh-96px)] flex-col gap-4 pb-6 sm:flex-row">
      <Sheet open={showMenu} onOpenChange={setShowMenu}>
        <SheetTrigger asChild>
          <Button className="sm:h-full" variant="outline">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Admin menu</SheetTitle>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="p-0"
                onClick={() => setShowMenu(false)}
              >
                <Link className="w-full px-3 py-1.5" to="/admin">
                  Home
                </Link>
              </Button>
              <Button
                variant="outline"
                className="p-0"
                onClick={() => setShowMenu(false)}
              >
                <Link
                  className="flex w-full items-center justify-center gap-2 px-3 py-1.5"
                  to="/admin/build"
                >
                  <HardHat />
                  <span>Map builder</span>
                </Link>
              </Button>
            </div>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <div className="max-h-[calc(100%-56px)] flex-grow sm:max-h-full">
        <Outlet />
      </div>
    </section>
  );
}
