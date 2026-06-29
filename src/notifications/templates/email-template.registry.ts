/**
 * Registry of transactional email templates.
 * Subject and metadata are owned here — callers never supply subjects.
 * HTML/text rendering lives in a future templates/ implementation phase.
 */
export const EMAIL_TEMPLATE = {
  VERIFY_EMAIL: "verify-email",
  WELCOME: "welcome",
  FORGOT_PASSWORD: "forgot-password",
  RESET_PASSWORD: "reset-password",
  CHANGE_EMAIL: "change-email",
  INVITATION: "invitation",
  AGENT_APPROVED: "agent-approved",
  NEW_CONVERSATION: "new-conversation",
  PROPERTY_PUBLISHED: "property-published",
  PROPERTY_ASSIGNED: "property-assigned",
} as const;

export type EmailTemplateId =
  (typeof EMAIL_TEMPLATE)[keyof typeof EMAIL_TEMPLATE];

export type EmailTemplateDefinition = {
  id: EmailTemplateId;
  subject: string;
  description: string;
  /** Future path to HTML/text template file. */
  path: string | null;
  /** Future template version for cache busting and migrations. */
  version: number;
};

export const EMAIL_TEMPLATE_REGISTRY: Record<
  EmailTemplateId,
  EmailTemplateDefinition
> = {
  [EMAIL_TEMPLATE.VERIFY_EMAIL]: {
    id: EMAIL_TEMPLATE.VERIFY_EMAIL,
    subject: "Verificá tu email",
    description: "Email address verification link or code",
    path: null,
    version: 1,
  },
  [EMAIL_TEMPLATE.WELCOME]: {
    id: EMAIL_TEMPLATE.WELCOME,
    subject: "Bienvenido a Propie",
    description: "Welcome message after registration",
    path: null,
    version: 1,
  },
  [EMAIL_TEMPLATE.FORGOT_PASSWORD]: {
    id: EMAIL_TEMPLATE.FORGOT_PASSWORD,
    subject: "Restablecé tu contraseña",
    description: "Password reset request confirmation",
    path: null,
    version: 1,
  },
  [EMAIL_TEMPLATE.RESET_PASSWORD]: {
    id: EMAIL_TEMPLATE.RESET_PASSWORD,
    subject: "Contraseña actualizada",
    description: "Password successfully reset confirmation",
    path: null,
    version: 1,
  },
  [EMAIL_TEMPLATE.CHANGE_EMAIL]: {
    id: EMAIL_TEMPLATE.CHANGE_EMAIL,
    subject: "Confirmá tu nuevo email",
    description: "Email address change confirmation",
    path: null,
    version: 1,
  },
  [EMAIL_TEMPLATE.INVITATION]: {
    id: EMAIL_TEMPLATE.INVITATION,
    subject: "Te invitaron a Propie",
    description: "User or agent invitation",
    path: null,
    version: 1,
  },
  [EMAIL_TEMPLATE.AGENT_APPROVED]: {
    id: EMAIL_TEMPLATE.AGENT_APPROVED,
    subject: "Tu solicitud de agente fue aprobada",
    description: "Agent application approved",
    path: null,
    version: 1,
  },
  [EMAIL_TEMPLATE.NEW_CONVERSATION]: {
    id: EMAIL_TEMPLATE.NEW_CONVERSATION,
    subject: "Nueva conversación",
    description: "New property conversation started",
    path: null,
    version: 1,
  },
  [EMAIL_TEMPLATE.PROPERTY_PUBLISHED]: {
    id: EMAIL_TEMPLATE.PROPERTY_PUBLISHED,
    subject: "Propiedad publicada",
    description: "Property published notification",
    path: null,
    version: 1,
  },
  [EMAIL_TEMPLATE.PROPERTY_ASSIGNED]: {
    id: EMAIL_TEMPLATE.PROPERTY_ASSIGNED,
    subject: "Te asignaron una propiedad",
    description: "Agent assigned to a property",
    path: null,
    version: 1,
  },
};

/** @deprecated Use EMAIL_TEMPLATE instead. */
export const EMAIL_TEMPLATE_IDS = EMAIL_TEMPLATE;

/** @deprecated Use EMAIL_TEMPLATE_REGISTRY values. */
export const EMAIL_TEMPLATE_CATALOG = Object.values(EMAIL_TEMPLATE_REGISTRY);

export function resolveEmailTemplate(
  templateId: EmailTemplateId,
): EmailTemplateDefinition {
  const definition = EMAIL_TEMPLATE_REGISTRY[templateId];

  if (!definition) {
    throw new Error(`Unknown email template: ${templateId}`);
  }

  return definition;
}
