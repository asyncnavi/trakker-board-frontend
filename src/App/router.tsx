import Boards from "@/pages/boards/BoardsListPage";
import SingleBoard from "@/pages/boards/SingleBoardPage";
import LoginPage from "@/pages/login";
import { createBrowserRouter } from "react-router";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Boards />,
  },
  {
    path: "/boards",
    children: [{ path: ":boardId", element: <SingleBoard /> }],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);
export default router;
