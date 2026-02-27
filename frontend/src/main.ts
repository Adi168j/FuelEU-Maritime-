import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { App } from "./App";

const rootElement = document.getElementById("app");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement as HTMLElement);
  root.render(
    React.createElement(
      React.StrictMode,
      null,
      React.createElement(App, null)
    )
  );
}

