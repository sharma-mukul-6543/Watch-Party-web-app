import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      isActive(path)
        ? "bg-indigo-600 text-white"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <header className="border-b border-slate-800 bg-slate-900">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <span className="text-3xl">🎬</span>

          <div>
            <h1 className="text-xl font-bold tracking-wide">
              Watch Party
            </h1>

            <p className="text-xs text-slate-400">
              Local Sync Mode
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link to="/" className={navLinkClass("/")}>
            Home
          </Link>

          <Link
            to="/create-room"
            className={navLinkClass("/create-room")}
          >
            Create Room
          </Link>

          <Link
            to="/join-room"
            className={navLinkClass("/join-room")}
          >
            Join Room
          </Link>
        </nav>
      </div>
    </header>
  );
}