import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { MobileAdminBottomNav } from "./MobileAdminBottomNav";
import { chatService } from "@/api/chatService";
import { toast } from "sonner";
import { ModeToggle } from "@/components/ModeToggle";
import { Menu, User, Store, ChevronRight, Plus, MessageSquare, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getActiveTenantSlug, userMatchesActiveTenant } from "@/lib/tenant";
import OrderNotificationBell from "./OrderNotificationBell";
import AdminUserDropdown from "./AdminUserDropdown";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!loading) {
      // In Luma Threads admin, grant dashboard access directly to store staff
      setCheckingAuth(false);
    }
  }, [loading]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Listen for unread messages
  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      try {
        const sessions = await chatService.getSessions();
        const totalUnread = (Array.isArray(sessions) ? sessions : []).reduce((acc, session) => {
          if (session.status === "active") {
            return acc + (session.unreadAdminCount || 0);
          }
          return acc;
        }, 0);
        setUnreadMessages(totalUnread);
      } catch (error) {
        // Silently handle offline/missing chat endpoint
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Successfully logged out");
      window.location.href = "/account/login";
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Admin Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="admin-mobile-toggle md:hidden p-2 hover:bg-accent rounded-xl transition-colors text-muted-foreground"
              aria-label="Toggle Menu"
            >
              <Menu size={22} />
            </button>
            <div className="hidden sm:flex flex-col gap-0.5 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Store size={16} className="text-emerald-500" />
                <ChevronRight size={14} className="opacity-40" />
                <span className="font-bold uppercase tracking-widest text-[10px] sm:text-xs">Admin Panel</span>
              </div>
              {user?.company?.name && (
                <span className="text-[10px] font-semibold text-primary pl-7">
                  {user.company.name} · {user.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1">
              <ModeToggle />
            </div>

            {/* Order Activity Notification Bell */}
            <OrderNotificationBell />

            {/* Customer Chat Messages */}
            <Link
              to="/admin/messages"
              className="relative p-2 text-muted-foreground hover:bg-accent hover:text-foreground rounded-xl transition-colors"
              title="Customer Messages"
              aria-label="Customer Messages"
            >
              <MessageSquare size={20} />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-card">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </Link>

            {/* Quick Add Product Button */}
            <Link
              to="/admin/products/add"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 text-[10px] sm:text-xs font-bold uppercase tracking-wider shrink-0"
            >
              <Plus size={16} />
              <span className="hidden xs:inline">Add Product</span>
            </Link>

            {/* Admin Profile & Logout Dropdown */}
            <AdminUserDropdown />
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto custom-scrollbar pb-24 lg:pb-0">
          <Outlet context={{ setIsSidebarOpen }} />
        </main>
        <MobileAdminBottomNav />
      </div>
    </div>
  );
};

export default AdminLayout;
