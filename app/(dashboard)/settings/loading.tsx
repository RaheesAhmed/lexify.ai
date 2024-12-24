import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function SettingsLoading() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-96 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="rounded-lg border p-6">
        <div className="space-y-6">
          <div className="space-y-4">
            {/* Simulate form fields */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              </div>
            ))}
          </div>

          {/* Simulate button */}
          <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}
