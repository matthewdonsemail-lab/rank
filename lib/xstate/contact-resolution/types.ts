export type ContactResolutionState =
  | "idle"
  | "checking_domain"
  | "checking_contact"
  | "deliverable"
  | "needs_alternate"
  | "bounced"
  | "failed"
  | "cancelled";

export interface ContactResolutionInput {
  owner: string;
  domain: string;
  candidateEmail: string;
  contactName: string;
  publicationUrl: string;
  startedAt: number;
}

export interface ContactResolutionContext {
  owner: string;
  domain: string;
  candidateEmail: string;
  contactName: string;
  publicationUrl: string;
  resolvedEmail: string | null;
  verificationSource: string | null;
  confidence: number | null;
  reason: string | null;
  attempt: number;
  checkedAt: number | null;
  error: string | null;
  startedAt: number;
  updatedAt: number;
}

export type ContactResolutionEvent =
  | { type: "START"; at: number }
  | { type: "DOMAIN_VERIFIED"; at: number; verificationSource: string; confidence: number }
  | { type: "DOMAIN_UNUSABLE"; at: number; reason: string }
  | { type: "CONTACT_RESOLVED"; at: number; email: string; verificationSource: string; confidence: number }
  | { type: "CONTACT_UNRESOLVED"; at: number; reason: string }
  | { type: "DELIVERY_BOUNCED"; at: number; reason: string }
  | { type: "FAIL"; at: number; error: string }
  | { type: "RETRY"; at: number }
  | { type: "CANCEL"; at: number };
