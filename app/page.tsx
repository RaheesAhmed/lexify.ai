import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Navigation } from "@/components/navigation";

const features = [
  {
    title: "Automated Document Analysis",
    description:
      "AI-powered analysis of legal documents with high precision and accuracy",
    icon: "📄",
  },
  {
    title: "Compliance Checking",
    description:
      "Ensure your documents meet regulatory requirements automatically",
    icon: "✓",
  },
  {
    title: "Smart Contract Review",
    description: "Intelligent review and risk assessment of legal contracts",
    icon: "🔍",
  },
  {
    title: "Legal Research Assistant",
    description:
      "AI-powered research tool to find relevant cases and precedents",
    icon: "📚",
  },
];

const testimonials = [
  {
    quote:
      "Lexify.ai has transformed how our firm handles document review. It's incredibly accurate and saves us countless hours.",
    author: "Sarah Chen",
    role: "Senior Partner, Chen Legal Group",
  },
  {
    quote:
      "The compliance checking feature alone has made this platform invaluable to our legal department.",
    author: "Michael Rodriguez",
    role: "Legal Director, Tech Innovations Inc.",
  },
  {
    quote:
      "A game-changer for legal research. The AI assistant finds relevant cases in minutes, not hours.",
    author: "Jessica Thompson",
    role: "Associate, Thompson & Partners",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen pt-16">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="hero-gradient" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Transform Legal Work with
              <span className="gradient-text"> AI-Powered Intelligence</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Streamline document analysis, ensure compliance, and accelerate
              legal research with state-of-the-art artificial intelligence.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="button-primary">Get Started Free</button>
              <button className="button-secondary">Book a Demo</button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Powerful Features for Modern Legal Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-card p-6 rounded-lg card-hover">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Trusted by Legal Professionals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-card p-8 rounded-lg card-hover">
                <p className="text-lg mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="w-[160px] h-[30px] mb-4">
                <Logo size="default" className="w-full h-full" />
              </div>
              <p className="text-sm text-muted-foreground">
                Next-generation legal document analysis and management platform
                powered by AI
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/security"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://twitter.com/lexifyai"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://linkedin.com/company/lexifyai"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/lexifyai"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Lexify.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
