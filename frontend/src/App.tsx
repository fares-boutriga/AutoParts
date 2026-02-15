import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth/store';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Dashboard from '@/pages/dashboard/Dashboard';
import ProductList from '@/pages/products/ProductList';
import ProductForm from '@/pages/products/ProductForm';
import StockManagement from '@/pages/stock/StockManagement';
import StockAlerts from '@/pages/stock/StockAlerts';
import OrderList from '@/pages/orders/OrderList';
import POS from '@/pages/pos/POS';
import CustomerList from '@/pages/customers/CustomerList';
import OutletList from '@/pages/outlets/OutletList';
import UserList from '@/pages/users/UserList';
import RoleList from '@/pages/roles/RoleList';
import NotificationList from '@/pages/notifications/NotificationList';
import CategoryList from '@/pages/categories/CategoryList';

// Protected Route Guard
const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Public Route Guard (redirect to dashboard if already logged in)
const PublicRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="stock" element={<StockManagement />} />
          <Route path="stock/alerts" element={<StockAlerts />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="outlets" element={<OutletList />} />
          <Route path="users" element={<UserList />} />
          <Route path="roles" element={<RoleList />} />
          <Route path="notifications" element={<NotificationList />} />
        </Route>
      </Route>

      {/* Catch all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
