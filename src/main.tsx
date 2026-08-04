import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { BookstoreProvider } from "./context/useBookstore"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BookstoreProvider>
      <App />
    </BookstoreProvider>
  </React.StrictMode>,
)
