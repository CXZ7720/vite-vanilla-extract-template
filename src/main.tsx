import ReactDOM from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import { routeTree } from './routeTree.gen'


// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    user: "AARON"
  }
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <React.StrictMode>
    <RouterProvider router={router} />
  // </React.StrictMode>
);
