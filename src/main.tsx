import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TooltipProvider } from "@/components/ui/tooltip";
import { APIProvider } from "@vis.gl/react-google-maps";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <StrictMode>
      <BrowserRouter>
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ""}>
          <TooltipProvider>
            <App />
          </TooltipProvider>
        </APIProvider>
      </BrowserRouter>
    </StrictMode>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>,
);
