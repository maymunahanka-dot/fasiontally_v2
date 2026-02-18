import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./styles/theme.css";
import App from "./App.jsx";
import { NewAuthProvider } from "./contexts/NewAuthContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <NewAuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </NewAuthProvider>
    </BrowserRouter>
  </StrictMode>
);
