export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-96 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Analytics Cards Loading */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-6 animate-pulse space-y-2"
          >
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-8 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Chart Loading */}
      <div className="rounded-xl border bg-card p-6">
        <div className="h-[300px] animate-pulse bg-muted rounded-md" />
      </div>

      {/* Documents Grid Loading */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Upload Card Loading */}
        <div className="col-span-1 rounded-xl border bg-card">
          <div className="border-b p-4">
            <div className="h-6 w-32 animate-pulse bg-muted rounded" />
          </div>
          <div className="p-4">
            <div className="h-32 animate-pulse bg-muted rounded-md" />
          </div>
        </div>

        {/* Recent Documents Loading */}
        <div className="col-span-2 rounded-xl border bg-card">
          <div className="border-b p-4">
            <div className="h-6 w-40 animate-pulse bg-muted rounded" />
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 animate-pulse bg-muted rounded-lg" />
                  <div className="space-y-2">
                    <div className="h-4 w-48 animate-pulse bg-muted rounded" />
                    <div className="h-3 w-32 animate-pulse bg-muted rounded" />
                  </div>
                </div>
                <div className="h-4 w-20 animate-pulse bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
