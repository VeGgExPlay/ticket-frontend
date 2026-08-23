import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import NotificationBell from "./NotificationBell.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <NavLink
              to="/tickets"
              className="text-xl font-semibold text-slate-900 dark:text-slate-100 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Tickets
            </NavLink>
            <div className="hidden md:flex items-center space-x-4">
              <NavLink
                to="/tickets"
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`
                }
              >
                Todos los tickets
              </NavLink>
              <NavLink
                to="/tickets/nuevo"
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`
                }
              >
                Nuevo ticket
              </NavLink>

              {user?.role === "agente" && (
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `text-sm font-medium ${isActive ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`
                  }
                >
                  Dashboard
                </NavLink>
              )}

              <NavLink
                to="/perfil"
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`
                }
              >
                Perfil
              </NavLink>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <NotificationBell />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              <span className="font-medium">{user.name}</span>
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                {user.role === "agente" ? "Agente" : "Cliente"}
              </span>
            </div>
            <button
              onClick={logout}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
