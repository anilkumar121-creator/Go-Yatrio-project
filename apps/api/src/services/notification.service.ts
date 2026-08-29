/**
 * Notification Service Abstraction
 *
 * Provides a clean interface for sending notifications without tying to specific providers.
 * Implementations can be swapped for email (SendGrid, Nodemailer), WhatsApp (Twilio, WATI),
 * push notifications, SMS, etc.
 */

export interface NotificationPayload {
  to: string | string[];
  subject?: string;
  message: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
  priority?: "low" | "normal" | "high" | "urgent";
  metadata?: Record<string, unknown>;
}

export interface EmailNotification extends NotificationPayload {
  from?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface WhatsAppNotification extends NotificationPayload {
  templateName?: string;
  languageCode?: string;
  components?: Array<{
    type: "header" | "body" | "footer" | "button";
    parameters: Array<{ type: "text" | "currency" | "date_time"; text?: string }>;
  }>;
}

export interface AdminNotification extends NotificationPayload {
  inquiryId: string;
  action: "created" | "status_changed" | "assigned" | "note_added";
  oldValue?: string;
  newValue?: string;
}

export type NotificationChannel = "email" | "whatsapp" | "admin" | "push" | "sms";

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  channel: NotificationChannel;
}

export interface INotificationService {
  sendEmail(payload: EmailNotification): Promise<NotificationResult>;
  sendWhatsApp(payload: WhatsAppNotification): Promise<NotificationResult>;
  sendAdminNotification(payload: AdminNotification): Promise<NotificationResult>;
  sendBulk(
    channel: NotificationChannel,
    payloads: NotificationPayload[],
  ): Promise<NotificationResult[]>;
  isConfigured(channel: NotificationChannel): boolean;
}

export class NotificationService implements INotificationService {
  private emailProvider?: IEmailProvider;
  private whatsAppProvider?: IWhatsAppProvider;
  private adminProvider?: IAdminProvider;

  constructor() {
    // Providers will be injected via setters or DI container
  }

  setEmailProvider(provider: IEmailProvider): void {
    this.emailProvider = provider;
  }

  setWhatsAppProvider(provider: IWhatsAppProvider): void {
    this.whatsAppProvider = provider;
  }

  setAdminProvider(provider: IAdminProvider): void {
    this.adminProvider = provider;
  }

  async sendEmail(payload: EmailNotification): Promise<NotificationResult> {
    if (!this.emailProvider) {
      console.warn("[NotificationService] Email provider not configured");
      return { success: false, error: "Email provider not configured", channel: "email" };
    }
    return this.emailProvider.send(payload);
  }

  async sendWhatsApp(payload: WhatsAppNotification): Promise<NotificationResult> {
    if (!this.whatsAppProvider) {
      console.warn("[NotificationService] WhatsApp provider not configured");
      return { success: false, error: "WhatsApp provider not configured", channel: "whatsapp" };
    }
    return this.whatsAppProvider.send(payload);
  }

  async sendAdminNotification(payload: AdminNotification): Promise<NotificationResult> {
    if (!this.adminProvider) {
      console.warn("[NotificationService] Admin provider not configured");
      return { success: false, error: "Admin provider not configured", channel: "admin" };
    }
    return this.adminProvider.send(payload);
  }

  async sendBulk(
    channel: NotificationChannel,
    payloads: NotificationPayload[],
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    for (const payload of payloads) {
      let result: NotificationResult;
      switch (channel) {
        case "email":
          result = await this.sendEmail(payload as EmailNotification);
          break;
        case "whatsapp":
          result = await this.sendWhatsApp(payload as WhatsAppNotification);
          break;
        case "admin":
          result = await this.sendAdminNotification(payload as AdminNotification);
          break;
        default:
          result = { success: false, error: `Channel ${channel} not supported for bulk`, channel };
      }
      results.push(result);
    }
    return results;
  }

  isConfigured(channel: NotificationChannel): boolean {
    switch (channel) {
      case "email":
        return !!this.emailProvider;
      case "whatsapp":
        return !!this.whatsAppProvider;
      case "admin":
        return !!this.adminProvider;
      default:
        return false;
    }
  }
}

export interface IEmailProvider {
  send(payload: EmailNotification): Promise<NotificationResult>;
}

export interface IWhatsAppProvider {
  send(payload: WhatsAppNotification): Promise<NotificationResult>;
}

export interface IAdminProvider {
  send(payload: AdminNotification): Promise<NotificationResult>;
}

export const notificationService = new NotificationService();
