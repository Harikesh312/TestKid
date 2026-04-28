import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Don't show on onboarding / auth pages
  const hideOn = ["/", "/welcome", "/consent", "/auth-choice", "/login", "/signup"];
  if (hideOn.includes(location.pathname)) return null;

  // Get initials for avatar
  const initials = user?.studentName
    ? user.studentName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "👤";

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.25)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}
    >
      {/* Reduced padding and height */}
      <div className="w-full px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 no-underline"
          style={{ textDecoration: "none" }}
        >
          <span className="text-2xl">🦉</span>
          <span
            className="text-xl font-bold text-white drop-shadow"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.03em" }}
          >
            TestKid
          </span>
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button
            id="navbar-profile-btn"
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.25)",
              border: "2px solid rgba(255,255,255,0.4)",
              cursor: "pointer",
            }}
          >
            {/* Avatar circle */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #6366f1, #a78bfa)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              {initials}
            </div>
            <span
              className="text-sm font-bold text-white drop-shadow hidden sm:block max-w-[100px] truncate"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {user?.studentName || "Student"}
            </span>
            <span className="text-white text-[10px] ml-1">{dropdownOpen ? "▲" : "▼"}</span>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div
              className="absolute right-0 top-12 w-52 rounded-2xl overflow-hidden animate-pop-in"
              style={{
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                border: "1px solid rgba(255,255,255,0.5)",
              }}
            >
              {/* User info */}
              <div
                className="px-4 py-3 text-center"
                style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white mx-auto mb-1"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #a78bfa)",
                  }}
                >
                  {initials}
                </div>
                <p className="text-sm font-bold text-gray-800 truncate">
                  {user?.studentName || "Student"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
              </div>

              {/* Menu items */}
              <div className="p-1.5">
                <DropdownItem
                  icon="🏠"
                  label="Home"
                  onClick={() => { navigate("/dashboard"); setDropdownOpen(false); }}
                />
                <DropdownItem
                  icon="📊"
                  label="My Results"
                  onClick={() => { navigate("/history"); setDropdownOpen(false); }}
                />
                <div style={{ height: "1px", background: "rgba(0,0,0,0.08)", margin: "4px 0" }} />
                <DropdownItem
                  icon="🚪"
                  label="Logout"
                  onClick={handleLogout}
                  danger
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, label, current }) {
  const active = current === to;
  return (
    <Link
      to={to}
      style={{ textDecoration: "none" }}
      className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200 ${
        active
          ? "text-white"
          : "text-white/80 hover:text-white"
      }`}
      {...(active && {
        style: {
          textDecoration: "none",
          background: "rgba(255,255,255,0.25)",
          border: "1px solid rgba(255,255,255,0.35)",
        },
      })}
    >
      {label}
    </Link>
  );
}

function DropdownItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
      style={{
        color: danger ? "#ef4444" : "#374151",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger ? "#fef2f2" : "#f3f4f6";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}