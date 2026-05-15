import React from "react";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type RegisterRole = "OWNER" | "AGENT";

export type RegisterData = {
  role: RegisterRole | null;

  firstName: string;
  lastName: string;

  email: string;
  password: string;

  acceptTerms: boolean;
  acceptPrivacy: boolean;

  verificationCode: string;
  verifiedAt: string | null;

  dni: string;
  birthDate: string;
  nationality: string;
  cuitCuil: string;
  address: string;

  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  pinEnabled: boolean;

  pin: string;

  recoveryEmail: string;
  recoveryPhone: string;

  profilePhoto: string | null;

  bio: string;

  mainGoal:
  | "PUBLISH"
  | "EXPLORE"
  | null;
};

type RegisterContextType = {
  data: RegisterData;

  updateData: (values: Partial<RegisterData>) => void;

  reset: () => void;
};

const initialData: RegisterData = {
  role: null,

  firstName: "",
  lastName: "",

  email: "",
  password: "",

  acceptTerms: false,
  acceptPrivacy: false,

  verificationCode: "",
  verifiedAt: null,

  dni: "",
  birthDate: "",
  nationality: "",
  cuitCuil: "",
  address: "",

  twoFactorEnabled: false,
  biometricEnabled: false,
  pinEnabled: false,
  pin: "",
  recoveryEmail: "",
  recoveryPhone: "",

  profilePhoto: null,

  bio: "",
  mainGoal: null,
};

const RegisterContext = createContext<
  RegisterContextType | undefined
>(undefined);

type Props = {
  children: ReactNode;
};

export function RegisterProvider({ children }: Props) {
  const [data, setData] = useState<RegisterData>(initialData);

  function updateData(values: Partial<RegisterData>) {
    setData((prev) => ({
      ...prev,
      ...values,
    }));
  }

  function reset() {
    setData(initialData);
  }

  const value = useMemo(
    () => ({
      data,
      updateData,
      reset,
    }),
    [data]
  );

  return (
    <RegisterContext.Provider value={value}>
      {children}
    </RegisterContext.Provider>
  );
}

export function useRegister() {
  const context = useContext(RegisterContext);

  if (!context) {
    throw new Error(
      "useRegister must be used within RegisterProvider"
    );
  }

  return context;
}