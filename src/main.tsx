import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { store } from "./app/store";
import { I18nProvider } from "./app/providers/I18nProvider";
import { ToasterProvider } from "./app/providers/ToasterProvider";
import "./utils/console"; // Import console utility to disable logs in production
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <I18nProvider>
        <BrowserRouter>
          <App />
          <ToasterProvider />
        </BrowserRouter>
      </I18nProvider>
    </Provider>
  </React.StrictMode>
);
