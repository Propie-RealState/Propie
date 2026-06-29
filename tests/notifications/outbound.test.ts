import { describe, expect, it, vi } from "vitest";

import { NotificationService } from "@/notifications/application/notification.service";
import type { EmailProvider } from "@/notifications/application/ports/email-provider.port";
import {
  EMAIL_TEMPLATE,
  EMAIL_TEMPLATE_REGISTRY,
  resolveEmailTemplate,
} from "@/notifications/templates";
import { NOTIFICATION_CHANNELS } from "@/notifications/domain/notification.types";
import { DevelopmentEmailProvider } from "@/notifications/infrastructure/providers/email/development-email.provider";
import { createEmailProvider } from "@/notifications/infrastructure/providers/email/create-email-provider";
import { createNotificationService } from "@/notifications/infrastructure/di/create-notification-service";

describe("outbound notification module", () => {
  it("creates development email provider by default", () => {
    const provider = createEmailProvider();
    expect(provider.name).toBe("development");
  });

  it("routes send() through NotificationService and resolves subject from registry", async () => {
    const sendEmail = vi.fn(async () => ({
      provider: "test",
      messageId: "msg-1",
    }));

    const provider: EmailProvider = {
      name: "test",
      sendEmail,
    };

    const service = new NotificationService(provider);
    const template = resolveEmailTemplate(EMAIL_TEMPLATE.WELCOME);

    const result = await service.send({
      channel: NOTIFICATION_CHANNELS.EMAIL,
      template: EMAIL_TEMPLATE.WELCOME,
      recipient: "user@example.com",
      payload: { firstName: "Ada" },
    });

    expect(sendEmail).toHaveBeenCalledWith({
      recipient: "user@example.com",
      subject: template.subject,
      template: EMAIL_TEMPLATE.WELCOME,
      payload: { firstName: "Ada" },
    });

    expect(result).toEqual({
      channel: NOTIFICATION_CHANNELS.EMAIL,
      provider: "test",
      messageId: "msg-1",
    });
  });

  it("defines subject in template registry for every template", () => {
    for (const definition of Object.values(EMAIL_TEMPLATE_REGISTRY)) {
      expect(definition.subject.length).toBeGreaterThan(0);
      expect(definition.version).toBeGreaterThan(0);
    }
  });

  it("logs resolved email in development provider", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const template = resolveEmailTemplate(EMAIL_TEMPLATE.VERIFY_EMAIL);

    const provider = new DevelopmentEmailProvider();
    const result = await provider.sendEmail({
      recipient: "user@example.com",
      subject: template.subject,
      template: EMAIL_TEMPLATE.VERIFY_EMAIL,
      payload: { code: "123456" },
    });

    expect(result.provider).toBe("development");
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining("EMAIL VERIFICATION"),
    );
    expect(infoSpy.mock.calls[0]?.[0]).toContain("user@example.com");
    expect(infoSpy.mock.calls[0]?.[0]).toContain("123456");
    expect(infoSpy.mock.calls[0]?.[0]).toContain("VERIFY_EMAIL");

    infoSpy.mockRestore();
  });

  it("wires createNotificationService with an email provider", () => {
    const service = createNotificationService();
    expect(service).toBeInstanceOf(NotificationService);
  });
});
