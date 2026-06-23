import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import routes from "./routes.jsx";

// This tells React to ignore the "/planA" part of the URL
const router = createBrowserRouter(routes, {
  basename: "/planA" 
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);