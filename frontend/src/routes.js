import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import Products from './pages/Products';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to="/dashboard/products" replace /> },
        { path: 'products', element: <Products /> }
        /* { path: 'app', element: <DashboardApp /> },
        { path: 'user', element: <User /> },
        { path: 'blog', element: <Blog /> } */
      ]
    },
    { path: '*', element: <Navigate to="/dashboard/products" replace /> }
  ]);
}
