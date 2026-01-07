import { createBrowserRouter } from "react-router";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { BoardsListPage, SingleBoardPage } from "@/pages/boards";
import LoginPage from "@/pages/login";
import VerifyPage from "@/pages/verify";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <BoardsListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/boards",
    children: [
      {
        path: ":boardId",
        element: (
          <ProtectedRoute>
            <SingleBoardPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "/verify",
    element: (
      <PublicRoute>
        <VerifyPage />
      </PublicRoute>
    ),
  },
]);

export default router;
