import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth/store';
import type { ReactNode } from 'react';
import Login from '@/pages/auth/Login';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Dashboard from '@/pages/dashboard/Dashboard';
import ProductList from '@/pages/products/ProductList';
import ProductForm from '@/pages/products/ProductForm';
import StockManagement from '@/pages/stock/StockManagement';
import StockAlerts from '@/pages/stock/StockAlerts';
import OrderList from '@/pages/orders/OrderList';
import POS from '@/pages/pos/POS';
import CustomerList from '@/pages/customers/CustomerList';
import UserList from '@/pages/users/UserList';
import RoleList from '@/pages/roles/RoleList';
import NotificationList from '@/pages/notifications/NotificationList';
import CategoryList from '@/pages/categories/CategoryList';
import StoreSettingsPage from '@/pages/settings/StoreSettings';
import UserProfile from '@/pages/profile/UserProfile';
import AccessDenied from '@/pages/errors/AccessDenied';
import { hasPermission, type PermissionKey } from '@/lib/auth/permissions';
import {
  buildLoginRedirectUrl,
  buildPathFromLocation,
  sanitizeRedirectPath,
} from '@/lib/auth/redirect';

// Protected Route Guard
const ProtectedRoute = () => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) return <Outlet />;

  const returnTo = sanitizeRedirectPath(
    buildPathFromLocation(location.pathname, location.search, location.hash),
  );

  return (
    <Navigate
      to={buildLoginRedirectUrl(returnTo)}
      replace
      state={{ from: location }}
    />
  );
};

// Public Route Guard (redirect to dashboard if already logged in)
const PublicRoute = () => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const redirectParam = new URLSearchParams(location.search).get('redirect');
  const redirectTo = sanitizeRedirectPath(redirectParam);
  return isAuthenticated ? <Navigate to={redirectTo} replace /> : <Outlet />;
};

const PermissionRoute = ({ permission, children }: { permission: PermissionKey; children: ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  return hasPermission(user, permission) ? <>{children}</> : <AccessDenied />;
};

function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route
            path="pos"
            element={(
              <PermissionRoute permission="sell_products">
                <POS />
              </PermissionRoute>
            )}
          />
          <Route
            path="products"
            element={(
              <PermissionRoute permission="manage_products">
                <ProductList />
              </PermissionRoute>
            )}
          />
          <Route
            path="products/new"
            element={(
              <PermissionRoute permission="manage_products">
                <ProductForm />
              </PermissionRoute>
            )}
          />
          <Route
            path="products/:id/edit"
            element={(
              <PermissionRoute permission="manage_products">
                <ProductForm />
              </PermissionRoute>
            )}
          />
          <Route
            path="categories"
            element={(
              <PermissionRoute permission="manage_products">
                <CategoryList />
              </PermissionRoute>
            )}
          />
          <Route
            path="stock"
            element={(
              <PermissionRoute permission="manage_stock">
                <StockManagement />
              </PermissionRoute>
            )}
          />
          <Route
            path="stock/alerts"
            element={(
              <PermissionRoute permission="view_notifications">
                <StockAlerts />
              </PermissionRoute>
            )}
          />
          <Route
            path="orders"
            element={(
              <PermissionRoute permission="sell_products">
                <OrderList />
              </PermissionRoute>
            )}
          />
          <Route
            path="customers"
            element={(
              <PermissionRoute permission="manage_customers">
                <CustomerList />
              </PermissionRoute>
            )}
          />
          <Route
            path="settings"
            element={(
              <PermissionRoute permission="manage_outlets">
                <StoreSettingsPage />
              </PermissionRoute>
            )}
          />
          <Route path="profile" element={<UserProfile />} />
          <Route
            path="users"
            element={(
              <PermissionRoute permission="manage_users">
                <UserList />
              </PermissionRoute>
            )}
          />
          <Route
            path="roles"
            element={(
              <PermissionRoute permission="manage_roles">
                <RoleList />
              </PermissionRoute>
            )}
          />
          <Route
            path="notifications"
            element={(
              <PermissionRoute permission="view_notifications">
                <NotificationList />
              </PermissionRoute>
            )}
          />
        </Route>
      </Route>

      {/* Catch all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
