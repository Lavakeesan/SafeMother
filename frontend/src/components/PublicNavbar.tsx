import { Link, useLocation } from "react-router-dom";
import { Shield, Lock, Menu, X, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PublicNavbarProps {
  showAuth?: boolean;
}

export function PublicNavbar({ showAuth = true }: PublicNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = [
    { label: "Features", id: "features" },
    { label: "How It Works", id: "how-it-works" },
    { label: "Our Impact", id: "impact" },
    { label: "Testimonials", id: "testimonials" },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
      scrolled 
        ? "bg-white/80 backdrop-blur-xl border-b border-slate-200 py-3 shadow-soft" 
        : "bg-transparent py-6"
    )}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl overflow-hidden border-2 border-primary/20 bg-white shadow-soft group-hover:scale-105 transition-transform duration-300">
              <img src="/logo.jpeg" alt="SafeMother Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl text-slate-900 tracking-tighter leading-none">SafeMother</span>
              <span className="text-[9px] font-black tracking-[0.2em] text-primary uppercase mt-1">Clinical Network</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {showAuth ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="font-black text-xs uppercase tracking-widest px-6 hover:bg-primary/5 hover:text-primary rounded-xl">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="font-black text-xs uppercase tracking-widest px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl h-11">
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
                <Button variant="ghost" onClick={() => window.history.back()} className="font-black text-xs uppercase tracking-widest gap-2">
                    Go Back
                </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-3 rounded-2xl bg-white border border-slate-100 shadow-soft"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-slate-900" />
            ) : (
              <Menu className="h-6 w-6 text-slate-900" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-100 shadow-premium animate-slide-up">
          <div className="px-6 py-10 space-y-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="block w-full text-left text-lg font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-2"
              >
                {link.label}
              </button>
            ))}
            
            {showAuth && (
              <div className="pt-6 grid grid-cols-2 gap-4">
                <Link to="/login">
                  <Button variant="outline" className="w-full font-black text-xs uppercase tracking-widest py-6 rounded-2xl border-2">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="w-full font-black text-xs uppercase tracking-widest py-6 rounded-2xl bg-primary">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
