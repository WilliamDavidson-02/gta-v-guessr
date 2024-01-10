import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export default function Navigation() {
  return (
    <nav className="flex w-full justify-between py-6">
      <img src="/gta_v_icon.svg" alt="Gta v logo" />
      <Button>
        <Link to="/login" reloadDocument>
          Login in
        </Link>
      </Button>
    </nav>
  );
}
