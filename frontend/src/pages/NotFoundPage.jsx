import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="text-center">
        <h1 className="mb-4 text-7xl font-bold">404</h1>

        <p className="mb-8 text-lg text-slate-400">
          The page you're looking for doesn't exist.
        </p>

        <Link
          to="/"
          className="inline-block rounded-xl bg-indigo-600 px-6 py-3 font-semibold transition hover:bg-indigo-500"
        >
          ← Back to Home
        </Link>
      </div>
    </section>
  );
}