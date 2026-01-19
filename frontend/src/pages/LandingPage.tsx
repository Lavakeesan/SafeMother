import { Link } from "react-router-dom";
import { Shield, CheckCircle, Users, BookOpen, AlertTriangle, ArrowRight, Lock, Cloud, Clock, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNavbar } from "@/components/PublicNavbar";
import heroIllustration from "@/assets/hero-illustration.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <CheckCircle className="h-4 w-4" />
                Trusted by 500+ Clinics
              </div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
                Empowering Midwives,{" "}
                <span className="text-primary">Protecting Mothers</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl">
                A comprehensive clinical support system designed to streamline maternal care, 
                track patient health, and provide instant expert guidance when it matters most.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg" className="gap-2">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline">
                    View Demo
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative animate-fade-in lg:animate-slide-in-left">
              <div className="relative">
                <img
                  src={heroIllustration}
                  alt="Midwife caring for newborn"
                  className="w-full max-w-lg mx-auto rounded-2xl"
                />
                <div className="absolute bottom-4 left-4 bg-card rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Patient Response Rate</p>
                    <p className="text-lg font-bold text-foreground">99.8%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary uppercase tracking-wide mb-2">
              Core Features
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Designed for the frontline of maternal care
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              SafeMother provides the tools midwives need to manage high-risk pregnancies and ensure safe deliveries.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Patient Tracking",
                description: "Comprehensive longitudinal records for every mother, including vitals history and appointment schedules.",
              },
              {
                icon: BookOpen,
                title: "Guidance Library",
                description: "Instant access to evidence-based clinical protocols and emergency procedures at the point of care.",
              },
              {
                icon: AlertTriangle,
                title: "Emergency Alerts",
                description: "Automated notification system for critical patient status, ensuring rapid response during emergencies.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-card rounded-xl p-6 border shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-8">
                Simplified workflow for dedicated professionals
              </h2>

              <div className="space-y-6">
                {[
                  {
                    step: 1,
                    title: "Register Your Clinic",
                    description: "Onboard your team and patients in minutes with our streamlined setup process.",
                  },
                  {
                    step: 2,
                    title: "Manage Patient Care",
                    description: "Use our intuitive dashboard to monitor health trends and schedule follow-ups.",
                  },
                  {
                    step: 3,
                    title: "Get Real-time Support",
                    description: "Access expert guidance and decision support tools during critical clinical moments.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted rounded-2xl p-8">
              <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-emergency/50" />
                  <div className="w-3 h-3 rounded-full bg-warning/50" />
                  <div className="w-3 h-3 rounded-full bg-success/50" />
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Dashboard Preview</p>
                <div className="space-y-3">
                  <div className="h-8 bg-muted rounded-md" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-20 bg-muted rounded-md" />
                    <div className="h-20 bg-muted rounded-md" />
                  </div>
                  <div className="h-32 bg-muted rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Security that patients and providers trust
              </h2>
              <p className="text-lg opacity-80 mb-8">
                We understand that medical data is sensitive. SafeMother is built with enterprise-grade 
                security protocols to ensure every byte of information remains confidential and protected.
              </p>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Shield, title: "HIPAA Compliant", description: "Full adherence to healthcare privacy standards." },
                  { icon: Lock, title: "Secure Data", description: "AES-256 bit encryption for all stored records." },
                  { icon: Clock, title: "24/7 Monitoring", description: "Proactive threat detection and system audits." },
                  { icon: Cloud, title: "Cloud Backups", description: "Automated redundancy for data preservation." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <item.icon className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm opacity-70">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex flex-col items-center p-8 rounded-2xl bg-background/10 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
                <p className="text-sm opacity-80 max-w-xs">
                  We never sell data. Our only goal is to support midwives in delivering safe care.
                </p>
                <Button variant="outline" className="mt-6 border-background/30 text-background hover:bg-background/10">
                  Read Privacy Policy
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Ready to transform your practice?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Join thousands of midwives around the world using SafeMother to provide better, safer care 
            for mothers and newborns.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
                Create Professional Account
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                  <Shield className="h-4 w-4" />
                </div>
                <span className="font-bold text-lg">SafeMother</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs">
                Professional healthcare platform for maternal and newborn care. 
                Empowering those who care for life.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: ["Features", "Medical Library", "Patient Portal", "Pricing"],
              },
              {
                title: "Company",
                links: ["About Us", "Our Mission", "Global Impact", "Contact"],
              },
              {
                title: "Legal",
                links: ["Privacy Policy", "Terms of Service", "Security", "Compliance"],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="font-semibold text-foreground mb-4">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 SafeMother Healthcare Systems. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-success">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Global Network Active
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
