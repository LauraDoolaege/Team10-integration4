import { Outlet, useNavigation } from "react-router";
import "./styles/reset.css";
import "./styles/style.css";

export default function Root() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <>
      {isLoading && (
        <div className="global-loader-overlay">
          <div className="spinner">Loading...</div>
        </div>
      )}
      <Outlet />
    </>
  );
}