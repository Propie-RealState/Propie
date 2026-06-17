import { Navigate } from 'react-router-dom';

/** Legacy registration steps moved to profile completion. */
export default function RegisterLegacyRedirect() {
  return <Navigate to="/perfil" replace state={{ completeProfile: true }} />;
}
