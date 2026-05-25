import { useEffect } from 'react';
import RegisterPropie from './RegisterDueño';
import { useRegister } from '../../context/RegisterContext';
import React from 'react';

/**
 * Explorer (CLIENT) registration reuses the owner signup form
 * with role preset — no property publishing permissions.
 */
export default function RegisterClient() {
  const { data, updateData } = useRegister();

  useEffect(() => {
    if (data.role !== 'CLIENT') {
      updateData({ role: 'CLIENT', mainGoal: 'EXPLORE' });
    }

    sessionStorage.removeItem('userType');
  }, [data.role, updateData]);

  return <RegisterPropie registrationKind="client" />;
}
