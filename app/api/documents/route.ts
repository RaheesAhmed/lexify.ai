import { NextResponse } from "next/server";
import { join } from "path";
import { writeFile, mkdir } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    console.log("GET /api/documents - Received request for userId:", userId);

    if (!userId) {
      console.log("GET /api/documents - No userId provided");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Verify user exists
    console.log("GET /api/documents - Looking up user:", userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log("GET /api/documents - User not found:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("GET /api/documents - Found user:", user.email);

    const documents = await prisma.document.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        title: true,
        file_type: true,
        file_size: true,
        created_at: true,
        updated_at: true,
        metadata: true,
      },
    });

    console.log("GET /api/documents - Found documents:", documents.length);

    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("GET /api/documents - Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    console.log("Received upload request");
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    console.log("Received data:", {
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      userId,
    });

    if (!file) {
      console.log("No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!userId) {
      console.log("No user ID provided");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Verify user exists
    console.log("Looking up user:", userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log("User not found:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.log("Found user:", user.email);

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      console.log("Invalid file type:", file.type);
      return NextResponse.json(
        {
          error: "Invalid file type. Only PDF and Word documents are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      console.log("File too large:", formatFileSize(file.size));
      return NextResponse.json(
        {
          error: "File size exceeds 10MB limit.",
        },
        { status: 400 }
      );
    }

    // Generate unique ID for the document
    const documentId = uuidv4();
    console.log("Generated document ID:", documentId);

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
      console.log("Created/verified uploads directory:", uploadDir);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
        console.error("Error creating upload directory:", error);
        return NextResponse.json(
          { error: "Failed to create upload directory" },
          { status: 500 }
        );
      }
    }

    // Save file to uploads directory
    try {
      const filePath = join(uploadDir, documentId);
      await writeFile(filePath, Buffer.from(await file.arrayBuffer()));
      console.log("Saved file to:", filePath);

      // Create document record in database
      console.log("Creating database record");
      const document = await prisma.document.create({
        data: {
          id: documentId,
          title: file.name, // Use file name as title
          content: "", // Empty content initially
          file_type: file.type,
          file_size: file.size,
          file_url: filePath,
          userId: userId,
          metadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
            status: "PENDING",
          },
        },
        select: {
          id: true,
          title: true,
          file_type: true,
          file_size: true,
          created_at: true,
          updated_at: true,
          metadata: true,
        },
      });
      console.log("Created document record:", document);

      return NextResponse.json({
        success: true,
        document,
      });
    } catch (error) {
      console.error("Error saving file:", error);
      return NextResponse.json(
        { error: "Failed to save the document" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "An error occurred during upload" },
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
