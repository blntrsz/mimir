import React from "react";
import ReactDOM from "react-dom/client";

import { StyledEngineProvider } from "@mui/material/styles";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";

import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "./api/queryClient.ts";
import { Layout } from "./features/layout.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        lazy: () => import("./pages/home"),
      },
      {
        path: "/:task_id",
        lazy: () => import("./pages/task"),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StyledEngineProvider>
  </React.StrictMode>,
);
