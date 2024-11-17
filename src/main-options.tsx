import "@sys42/ui/base.css";
import "@sys42/ui/default-custom-properties.css";

import React from "react";
import ReactDOM from "react-dom/client";

import Options from "./Options.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>,
);
