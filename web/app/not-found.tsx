import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty-cart">
      <h1>Page not found</h1>
      <Link href="/" className="btn">
        Back home
      </Link>
    </div>
  );
}
