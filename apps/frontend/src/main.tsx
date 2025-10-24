import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import LoginPage from './pages/LoginPage.tsx';
import AdminPage from './pages/AdminPage.tsx'; // <-- Import AdminPage

const queryClient = new QueryClient();

const router = createBrowserRouter([
  // Specific Admin route - place before wildcard
  {
    path: "/admin",
    element: <AdminPage />, // <-- Add AdminPage route
  },
  // Login route
  {
    path: "/login",
    element: <LoginPage />,
  },
  // Wildcard for App (map, stay details) - MUST be last
  {
    path: "/*",
    element: <App />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);