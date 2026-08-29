// Prisma client extensions for Phase 16 models
declare module "@goyatrio/database" {
  interface PrismaClient {
    inquiry: unknown;
    inquiryNote: unknown;
    inquiryActivity: unknown;
    inquiryAssignment: unknown;
  }
  export type InquiryStatusNew =
    | "NEW"
    | "CONTACTED"
    | "FOLLOW_UP"
    | "QUALIFIED"
    | "PROPOSAL_SENT"
    | "NEGOTIATION"
    | "WON"
    | "LOST"
    | "CLOSED";
  export type InquiryPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  export type InquirySource =
    | "WEBSITE"
    | "PACKAGE_PAGE"
    | "HOTEL_PAGE"
    | "CAB_PAGE"
    | "CONTACT_FORM"
    | "BLOG_PAGE"
    | "WHATSAPP"
    | "PHONE"
    | "EMAIL"
    | "MANUAL";
  export type InquiryType = "TOUR_PACKAGE" | "HOTEL" | "CAB" | "GENERAL" | "CUSTOM_TOUR";
}
