import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex h-[calc(100vh-96px)] w-full items-center justify-center">
      <Loader2 className="animate-spin" size={128} />
    </div>
  );
}
