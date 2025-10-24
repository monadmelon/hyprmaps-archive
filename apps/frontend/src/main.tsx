import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' // <-- 1. Import

const queryClient = new QueryClient() // <-- 2. Create a client

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}> {/* <-- 3. Wrap your App */}
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)