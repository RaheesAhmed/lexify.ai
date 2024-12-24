import { cn } from "@/lib/utils";

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: "default" | "white";
}

export function Logo({ variant = "default", className, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      className={cn("w-auto", className)}
      {...props}
    >
      <defs>
        <linearGradient id="text-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop
            offset="0%"
            style={{
              stopColor: variant === "white" ? "#fff" : "#1e293b",
            }}
          />
          <stop
            offset="90%"
            style={{
              stopColor: variant === "white" ? "#fff" : "#334155",
            }}
          />
        </linearGradient>
        <filter id="soft-glow">
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feComposite in="blur" in2="SourceGraphic" operator="over" />
        </filter>
      </defs>
      <g transform="translate(10, 35)">
        <text
          fontFamily="Satoshi, sans-serif"
          fontSize="38"
          fontWeight="600"
          letterSpacing="-0.03em"
          filter="url(#soft-glow)"
          dominantBaseline="middle"
        >
          <tspan fill="url(#text-gradient)">lexify</tspan>
          <tspan fill={variant === "white" ? "#fff" : "#0ea5e9"} dx="-0.05em">
            .ai
          </tspan>
        </text>
      </g>
    </svg>
  );
}
