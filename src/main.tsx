import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import App from "./App.tsx";
import { ThemeProvider } from "./theme/ThemeProvider.tsx";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("No se encontro el elemento #root");

createRoot(root).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </MotionConfig>
  </StrictMode>,
);
