export interface AnalysisResult {
  documentId: string;
  summary: string;
  riskScore: number;
  keyTerms: string[];
  legalCitations: Citation[];
  entities: Entity[];
  recommendations: string[];
  confidence: number;
}

export interface Citation {
  text: string;
  type: "case" | "statute" | "regulation";
  relevance: number;
}

export interface Entity {
  name: string;
  type: "person" | "organization" | "location" | "date";
  mentions: number;
}
