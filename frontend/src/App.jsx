import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import History from "./pages/History";
import Patients from "./pages/Patients";
import { getAlertCount } from "./services/api";

const NAV = [
  { to: "/", label: "Dashboard", icon: "⬛" },
  { to: "/alerts", label: "Alerts", icon: "⚠" },
  { to: "/history", label: "History", icon: "📈" },
  { to: "/patients", label: "Patients", icon: "👤" },
];

export default function App() {
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const load = () => getAlertCount().then(d => setAlertCount(d.count));
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-bg text-text overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 bg-surface border-r border-border flex flex-col">
          <div className="p-5 border-b border-border">
            <h1 className="text-primary font-bold text-lg">UroSense</h1>
            <p className="text-muted text-xs">IoT Urine Monitor</p>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {NAV.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-primary/20 text-primary font-medium"
                      : "text-muted hover:text-text hover:bg-white/5"
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.label === "Alerts" && alertCount > 0 && (
                  <span className="ml-auto bg-danger text-white text-xs px-1.5 py-0.5 rounded-full">
                    {alertCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-border">
            <p className="text-muted text-xs">v1.0.0 · Single user</p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/history" element={<History />} />
            <Route path="/patients" element={<Patients />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
