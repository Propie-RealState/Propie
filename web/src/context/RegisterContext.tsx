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
import {
  emptyRegistrationProgress,
  normalizeRegistrationProgress,
  type RegistrationProgress,
} from "../features/register/registrationProgress";

export type RegisterRole = "OWNER" | "AGENT" | "CLIENT";
export type { RegistrationProgress };

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

  phone: string;

  profilePhoto: string | null;

  bio: string;

  mainGoal:
  | "PUBLISH"
  | "EXPLORE"
  | null;

  /** Non-secret wizard progress for route guards (sessionStorage-safe). */
  registrationProgress: RegistrationProgress;
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

  phone: "",

  profilePhoto: null,

  bio: "",
  mainGoal: null,

  registrationProgress: emptyRegistrationProgress(),
};

const REGISTER_STORAGE_KEY =
  "propie.registerDraft";

/** Never written to sessionStorage (auth secrets). */
const REGISTER_SECRET_KEYS = ["password"] as const satisfies ReadonlyArray<
  keyof RegisterData
>;

type RegisterSecrets = Pick<
  RegisterData,
  (typeof REGISTER_SECRET_KEYS)[number]
>;

function emptySecrets(): RegisterSecrets {
  return {
    password: "",
  };
}

/**
 * Page-lifetime secret memory (cleared on full reload).
 * Keeps password available across RegisterProvider remounts
 * without writing it to sessionStorage.
 */
let memorySecrets: RegisterSecrets = emptySecrets();

function captureSecrets(data: RegisterData) {
  memorySecrets = {
    password: data.password,
  };
}

function applyMemorySecrets(data: RegisterData): RegisterData {
  return {
    ...data,
    ...memorySecrets,
  };
}

function toPersistedRegisterData(
  data: RegisterData,
): Omit<RegisterData, (typeof REGISTER_SECRET_KEYS)[number]> {
  const { password: _password, ...persisted } = data;
  return persisted;
}

function stripSecretsFromDraft(
  draft: Partial<RegisterData>,
): RegisterData {
  const merged: RegisterData = {
    ...initialData,
    ...draft,
    registrationProgress: normalizeRegistrationProgress(
      draft.registrationProgress,
    ),
  };

  for (const key of REGISTER_SECRET_KEYS) {
    merged[key] = initialData[key];
  }

  return merged;
}

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
      // No draft ⇒ treat as a fresh registration session.
      // Drop page-lifetime secrets so a cleared sessionStorage cannot
      // rehydrate credentials from a previous incomplete attempt.
      memorySecrets = emptySecrets();
      return { ...initialData };
    }

    return applyMemorySecrets(
      stripSecretsFromDraft(
        JSON.parse(stored) as Partial<RegisterData>,
      ),
    );
  } catch {
    memorySecrets = emptySecrets();
    return { ...initialData };
  }
}

function persistRegisterData(data: RegisterData) {
  if (typeof window === "undefined") {
    return;
  }

  captureSecrets(data);
  window.sessionStorage.setItem(
    REGISTER_STORAGE_KEY,
    JSON.stringify(toPersistedRegisterData(data)),
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
    memorySecrets = emptySecrets();
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
