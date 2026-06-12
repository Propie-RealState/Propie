import { Outlet } from "react-router-dom";

import { RegisterProgress } from "./RegisterProgress";

export function RegisterStepLayout() {
  return (
    <>
      <RegisterProgress />
      <Outlet />
    </>
  );
}
