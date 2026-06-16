import { Outlet } from "react-router-dom";

export function RegisterStepLayout() {
  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        overflowX: "hidden",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <Outlet />
    </div>
  );
}
