import { toast } from "sonner";

interface ErrorResponse {
  error?: string;
  message?: string;
  details?: string;
}

export class ApiError extends Error {
  public status: number;
  public details?: string;

  constructor(message: string, status: number = 500, details?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function handleApiResponse(response: Response) {
  if (!response.ok) {
    const data: ErrorResponse = await response.json().catch(() => ({}));
    throw new ApiError(
      data.error || data.message || "An error occurred",
      response.status,
      data.details
    );
  }
  return response.json();
}

export function handleError(error: unknown, customMessage?: string) {
  console.error("Error:", error);

  if (error instanceof ApiError) {
    // Handle API errors
    if (error.status === 401) {
      toast.error("Please sign in to continue");
      return;
    }
    if (error.status === 403) {
      toast.error("You don't have permission to perform this action");
      return;
    }
    toast.error(error.message);
  } else if (error instanceof Error) {
    // Handle other known errors
    toast.error(customMessage || error.message);
  } else {
    // Handle unknown errors
    toast.error(customMessage || "An unexpected error occurred");
  }
}
