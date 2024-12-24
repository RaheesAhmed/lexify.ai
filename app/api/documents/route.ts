import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

// Mock database - Replace with actual database
const documents = new Map();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Only PDF and Word documents are allowed.",
        },
        { status: 400 }
      );
    }

    // Generate unique ID for the document
    const documentId = uuidv4();

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), "uploads");
    try {
      await writeFile(
        join(uploadDir, documentId),
        Buffer.from(await file.arrayBuffer())
      );
    } catch (error) {
      console.error("Error saving file:", error);
      return NextResponse.json(
        { error: "Failed to save file" },
        { status: 500 }
      );
    }

    // Store document metadata
    const document = {
      id: documentId,
      name: file.name,
      type: file.type,
      size: formatFileSize(file.size),
      status: "Uploaded",
      lastUpdated: new Date().toISOString(),
      content: "", // Will be populated during analysis
      analysis: null,
      riskScore: null,
      clauses: [],
      compliance: [],
    };

    documents.set(documentId, document);

    return NextResponse.json({
      id: documentId,
      name: file.name,
      status: "Uploaded",
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Get all documents
    const documentList = Array.from(documents.values()).map((doc) => ({
      id: doc.id,
      name: doc.name,
      status: doc.status,
      lastUpdated: doc.lastUpdated,
      size: doc.size,
    }));

    return NextResponse.json(documentList);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
