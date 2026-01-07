import { RouterProvider } from "react-router";
import router from "./router";
import { Toaster } from "@/components/ui/sonner";

import { useThemeEffect } from "@/store/theme";
import { ReactQueryProvider } from "@/lib/react-query";

function App() {
  useThemeEffect();

  return (
    <ReactQueryProvider>
      <Toaster />
      <RouterProvider router={router} />
    </ReactQueryProvider>
  );
}

export default App;
