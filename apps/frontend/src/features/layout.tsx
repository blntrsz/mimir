import { Link, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <>
      <header className="border-b-1 flex flex-col bg-blue-700 p-4 font-bold text-white">
        <Link to="/">
          <h2>Mimir's well</h2>
        </Link>
      </header>
      <main className="flex flex-col gap-16 p-4">
        <Outlet />
      </main>
    </>
  );
}
