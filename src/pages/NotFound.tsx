import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div>
      <h1>Page not Found!</h1>
      <p>Pleas return back to home page</p>
      <Link to="/" replace>
        Home
      </Link>
    </div>
  );
}
