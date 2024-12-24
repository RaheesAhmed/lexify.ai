import { Logo } from "@/components/ui/logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Auth Form */}
      <div className="flex flex-col justify-center items-center p-8 lg:p-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-block mb-8">
            <Logo className="h-8 w-auto" />
          </Link>
          {children}
        </div>
      </div>

      {/* Right side - Background Image/Pattern */}
      <div className="hidden lg:block relative bg-muted">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-success/10" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Lexify.ai has transformed our legal practice, making
              document analysis and compliance checking effortless and
              precise.&rdquo;
            </p>
            <footer className="text-sm">Sofia Chen, Legal Tech Director</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
