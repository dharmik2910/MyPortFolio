import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ContentProvider } from "./lib/ContentContext";
import { ThemeProvider } from "./lib/theme";

// The admin panel is code-split so visitors never download it.
const Admin = lazy(() => import("./admin/Admin"));
const isAdminRoute = /^\/admin(\/|$)/.test(window.location.pathname);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider>
    {isAdminRoute ? (
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
    ) : (
      <ContentProvider>
        <App />
      </ContentProvider>
    )}
  </ThemeProvider>,
);
