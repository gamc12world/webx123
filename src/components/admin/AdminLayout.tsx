import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  React.useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white">
        <div className="p-6">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        <nav className="mt-6">
          <ul className="space-y-2">
            <li>
              <Link
                to="/admin"
                className="flex items-center px-6 py-3 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <LayoutDashboard size={18} className="mr-3" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/admin/products"
                className="flex items-center px-6 py-3 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <ShoppingBag size={18} className="mr-3" />
                Products
              </Link>
            </li>
            <li>
              <Link
                to="/admin/orders"
                className="flex items-center px-6 py-3 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <Package size={18} className="mr-3" />
                Orders
              </Link>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 border-t border-slate-800">
          <Link
            to="/"
            className="flex items-center px-6 py-3 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft size={18} className="mr-3" />
            Back to Store
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-6 py-3 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <LogOut size={18} className="mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;