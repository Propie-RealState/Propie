import React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type RegisterRole = "OWNER" | "AGENT" | "CLIENT";

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
  location: string;

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
  location: "",

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

const REGISTER_STORAGE_KEY =
  "propie.registerDraft";

function readStoredRegisterData() {
  if (typeof window === "undefined") {
    return initialData;
  }

  try {
    const stored =
      window.sessionStorage.getItem(
        REGISTER_STORAGE_KEY
      );

    if (!stored) {
      return initialData;
    }

    return {
      ...initialData,
      ...JSON.parse(stored),
    } as RegisterData;
  } catch {
    return initialData;
  }
}

function persistRegisterData(data: RegisterData) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    REGISTER_STORAGE_KEY,
    JSON.stringify(data)
  );
}

const RegisterContext = createContext<
  RegisterContextType | undefined
>(undefined);

type Props = {
  children: ReactNode;
};

export function RegisterProvider({ children }: Props) {
  const [data, setData] =
    useState<RegisterData>(
      readStoredRegisterData
    );

  const updateData = useCallback((values: Partial<RegisterData>) => {
    setData((prev) => {
      const next = {
        ...prev,
        ...values,
      };

      persistRegisterData(next);

      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setData(initialData);

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(
        REGISTER_STORAGE_KEY
      );
    }
  }, []);

  useEffect(() => {
    persistRegisterData(data);
  }, [data]);

  const value = useMemo(
    () => ({
      data,
      updateData,
      reset,
    }),
    [data, updateData, reset],
  );

  return (
    <RegisterContext.Provider value={value}>
      {children}
    </RegisterContext.Provider>
  );
}

export function useRegisterOptional() {
  return useContext(RegisterContext);
}

export function useRegister() {
  const context = useRegisterOptional();

  if (!context) {
    throw new Error(
      "useRegister must be used within RegisterProvider"
    );
  }

  return context;
}
