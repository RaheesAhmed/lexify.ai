import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mock database - Replace with actual database
const documents = new Map();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get document from database
    const document = documents.get(params.id);
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get document from database
    const document = documents.get(params.id);
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Update document status to Processing
    document.status = "Processing";
    documents.set(params.id, document);

    // Analyze document content using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a legal document analyzer. Analyze the following document and extract key clauses, assess risks, and check compliance.",
        },
        {
          role: "user",
          content: document.content,
        },
      ],
    });

    // Process the analysis results
    const analysis = completion.choices[0].message.content;

    // Update document with analysis results
    document.status = "Analyzed";
    document.lastUpdated = new Date().toISOString();
    document.analysis = analysis;

    // Calculate risk score based on analysis
    document.riskScore = calculateRiskScore(analysis);

    // Extract clauses and compliance checks
    const { clauses, compliance } = extractAnalysisResults(analysis);
    document.clauses = clauses;
    document.compliance = compliance;

    // Save updated document
    documents.set(params.id, document);

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error analyzing document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function calculateRiskScore(analysis: string): number {
  // Implement risk score calculation based on analysis
  // This is a placeholder implementation
  return Math.floor(Math.random() * 100);
}

function extractAnalysisResults(analysis: string) {
  // Implement extraction of clauses and compliance checks from analysis
  // This is a placeholder implementation
  return {
    clauses: [
      {
        id: 1,
        type: "Liability",
        content: "Sample liability clause",
        risk: "medium",
        recommendation: "Consider adding specific liability caps",
      },
    ],
    compliance: [
      {
        id: 1,
        check: "GDPR Compliance",
        status: "passed",
        details: "Data protection clauses are present and compliant",
      },
    ],
  };
}
