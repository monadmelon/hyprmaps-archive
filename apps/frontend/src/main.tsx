import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'; // 1. Import router

const queryClient = new QueryClient()

// 2. Create your router with a route for your App component
const router = createBrowserRouter([
  {
    path: "/*", // Match all routes
    element: <App />, // Render the App component
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* 3. Provide the router to your app */}
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)