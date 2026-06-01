import { StrictMode } from "react";
import { HydratedRouter } from "react-router/dom";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HydratedRouter />
  </StrictMode>
);