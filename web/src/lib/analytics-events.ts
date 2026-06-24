/**
 * Centralized analytics event names.
 * Every tracked event must be declared here.
 */
export const AnalyticsEvents = {
  // Authentication
  AUTH_SIGNUP: "auth_signup",
  AUTH_LOGIN: "auth_login",
  AUTH_LOGOUT: "auth_logout",

  // Properties
  PROPERTY_CREATED: "property_created",
  PROPERTY_PUBLISHED: "property_published",
  PROPERTY_UPDATED: "property_updated",

  // Agent Applications
  AGENT_APPLICATION_SUBMITTED: "agent_application_submitted",
  AGENT_APPLICATION_ACCEPTED: "agent_application_accepted",
  AGENT_APPLICATION_REJECTED: "agent_application_rejected",

  // Messaging
  CONVERSATION_STARTED: "conversation_started",
  MESSAGE_SENT: "message_sent",

  // Visits
  VISIT_CREATED: "visit_created",
  VISIT_CONFIRMED: "visit_confirmed",
  VISIT_COMPLETED: "visit_completed",
  VISIT_CANCELLED: "visit_cancelled",
} as const;
