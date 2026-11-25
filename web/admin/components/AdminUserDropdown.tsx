import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Settings, ExternalLink, ShieldCheck, ChevronDown, Store } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export const AdminUserDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      setIsOpen(false);
      await logout();
      toast.success("Successfully logged out");
      window.location.href = "/account/login";
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const displayName = user?.name || "Store Administrator";
  const displayEmail = user?.email || "admin@lumathreads.com";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-accent border border-transparent hover:border-border transition-all focus:outline-none group"
        aria-label="User profile menu"
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
          {initials || <User size={18} />}
        </div>
        <div className="hidden lg:flex flex-col text-left">
          <span className="text-xs font-bold text-foreground leading-tight truncate max-w-[120px]">
            {displayName}
          </span>
          <span className="text-[10px] text-muted-foreground leading-tight">Admin</span>
        </div>
        <ChevronDown size={14} className="hidden sm:block text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* User Info Header */}
            <div className="p-4 border-b border-border bg-accent/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-500/20 shrink-0">
                  {initials || <User size={20} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Store Administrator
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Links */}
            <div className="p-2 space-y-1">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-accent transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Store size={15} className="text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                  <span>View Storefront</span>
                </div>
                <ExternalLink size={13} className="text-muted-foreground" />
              </a>

              <Link
                to="/admin/company-settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-accent transition-colors group"
              >
                <Settings size={15} className="text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                <span>Store Settings</span>
              </Link>
            </div>

            {/* Sign Out Button */}
            <div className="p-2 border-t border-border bg-accent/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUserDropdown;
