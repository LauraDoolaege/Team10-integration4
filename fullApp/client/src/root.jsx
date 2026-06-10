import { Outlet } from "react-router";
import "./styles/reset.css";
import "./styles/style.css";

export default function Root() {
  return <Outlet />;
}