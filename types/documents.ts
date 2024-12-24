export interface Document {
  id: string;
  title: string;
  content: string;
  metadata: DocumentMetadata;
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
  createdById: string;
}

export type DocumentStatus =
  | "draft"
  | "pending_analysis"
  | "analyzed"
  | "needs_review"
  | "approved";

export interface DocumentMetadata {
  documentType: DocumentType;
  pageCount: number;
  wordCount: number;
  language: string;
  confidenceScore: number;
  tags: string[];
}

export type DocumentType =
  | "contract"
  | "brief"
  | "court_order"
  | "legal_memo"
  | "correspondence";
