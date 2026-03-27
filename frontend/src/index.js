import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// ✅ Redux
import { Provider } from "react-redux";
import { store } from "./redux/store";

// ✅ Context Providers
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FontSizeProvider } from "./contexts/FontSizeContext";
import { AlertProvider } from "./contexts/AlertContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    {/* ✅ Redux Provider added */}
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider>
          <FontSizeProvider>
            <AlertProvider>
              <App />
            </AlertProvider>
          </FontSizeProvider>
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  </React.StrictMode>,
);

reportWebVitals();
