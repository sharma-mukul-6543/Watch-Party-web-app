import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <section className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="w-full max-w-4xl text-center">
        <div className="mb-6">
          <span className="text-7xl">🎬</span>
        </div>

        <h1 className="mb-4 text-5xl font-extrabold tracking-tight">
          Private Watch Party
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg leading-8 text-slate-400">
          Watch movies together with perfectly synchronized playback.
          Every participant plays their own local movie file while the
          application keeps everyone in sync using Socket.io.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/create-room"
            className="w-64 rounded-xl bg-indigo-600 px-6 py-4 text-lg font-semibold transition hover:bg-indigo-500"
          >
            🎥 Create Room
          </Link>

          <Link
            to="/join-room"
            className="w-64 rounded-xl border border-slate-700 bg-slate-900 px-6 py-4 text-lg font-semibold transition hover:border-indigo-500 hover:bg-slate-800"
          >
            🚪 Join Room
          </Link>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="mb-2 text-xl font-semibold">
              ⚡ Instant Playback
            </h3>

            <p className="text-sm text-slate-400">
              Your movie plays directly from your own computer for maximum
              quality and zero buffering.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="mb-2 text-xl font-semibold">
              🔄 Perfect Sync
            </h3>

            <p className="text-sm text-slate-400">
              Play, pause and seek actions are synchronized across every
              participant in the room.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="mb-2 text-xl font-semibold">
              🔒 Private Rooms
            </h3>

            <p className="text-sm text-slate-400">
              Create a private room, invite friends and enjoy movies together
              without uploading any video.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}