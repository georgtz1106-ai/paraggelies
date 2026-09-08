import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { to: "/suppliers", label: "Προμηθευτές" },
  { to: "/products", label: "Προϊόντα" },
  { to: "/orders/new", label: "Νέα Παραγγελία" },
  { to: "/orders", label: "Ιστορικό" },
];

export function Layout() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-2 flex flex-col gap-2 sm:h-14 sm:flex-row sm:items-center sm:justify-between sm:py-0">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Παραγγελίες</span>
            <button onClick={() => signOut()} className="sm:hidden text-sm text-gray-500 hover:text-gray-800">
              Αποσύνδεση
            </button>
          </div>
          <nav className="flex gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            onClick={() => signOut()}
            className="hidden sm:block text-sm text-gray-500 hover:text-gray-800"
          >
            Αποσύνδεση
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
