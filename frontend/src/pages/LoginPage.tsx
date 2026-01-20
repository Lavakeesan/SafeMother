import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Shield, Mail, Lock, CheckCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import heroIllustration from "@/assets/hero-illustration.png";

type UserRole = "midwife" | "patient" | "admin";

export default function LoginPage() {
  const location = useLocation();
  // Default to true if not /register
  const [isLogin, setIsLogin] = useState(location.pathname !== "/register");
  const [selectedRole, setSelectedRole] = useState<UserRole>("midwife");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login API Call
        const response = await fetch("http://localhost:5001/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("Logged in successfully");
          // Store token (todo: use context/localstorage)
          localStorage.setItem("userInfo", JSON.stringify(data));

          if (data.role === "midwife") navigate("/midwife");
          else if (data.role === "patient") navigate("/patient");
          else navigate("/admin");
        } else {
          toast.error(data.message || "Invalid email or password");
        }
      } else {
        // Register API Call
        const response = await fetch("http://localhost:5001/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({
            name,
            email,
            password,
            role: selectedRole,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("Registration successful! Please login.");
          setIsLogin(true); // Switch to login mode
          setPassword(""); // Clear password
        } else {
          toast.error(data.message || "Registration failed");
        }
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-muted/30 p-8 lg:p-12">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-4 w-4" />
          </div>
          <span className="font-bold text-lg">SafeMother</span>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md">
            <img
              src={heroIllustration}
              alt="Maternal care illustration"
              className="w-full max-w-sm mx-auto mb-8"
            />
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
              Professional Maternal & Newborn Care
            </h2>
            <p className="mt-4 text-muted-foreground">
              Access SafeMother's professional evidence-based resources and clinical tools
              designed for modern maternal healthcare practitioners.
            </p>

            <div className="flex gap-3 mt-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border text-sm">
                <CheckCircle className="h-4 w-4 text-success" />
                HIPAA Compliant
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border text-sm">
                <Lock className="h-4 w-4 text-primary" />
                Secure Protocol
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          © 2024 SAFEMOTHER | PROFESSIONAL CLINICAL PLATFORM | V2.4.0-STABLE
        </p>
      </div>

      {/* Right Panel - Login/Register Form */}
      <div className="flex flex-col justify-center p-8 lg:p-12">
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-4 w-4" />
          </div>
          <span className="font-bold text-lg">SafeMother</span>
        </div>

        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              {isLogin ? "Clinical Portal" : "create Account"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isLogin ? "Welcome to SafeMother. Please sign in to your account." : "Join SafeMother to access clinical resources."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {/* Role Selector */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {isLogin ? "Accessing As:" : "Registering As:"}
              </Label>
              <div className="mt-2 grid grid-cols-3 gap-2 p-1 bg-muted rounded-lg">
                {(["midwife", "patient", "admin"] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`py-2.5 px-4 rounded-md text-sm font-medium transition-colors capitalize ${selectedRole === role
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Name (Register Only) */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Dr. Sarah Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="clinician@safemother.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
                {isLogin && <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot?
                </Link>}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Remember Me */}
            {isLogin && <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal">
                Keep me logged in
              </Label>
            </div>}

            {/* Submit */}
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Processing..." : (isLogin ? "SIGN IN TO SAFEMOTHER" : "CREATE ACCOUNT")}
            </Button>

            {/* Toggle Login/Register */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </span>{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  navigate(isLogin ? "/register" : "/login");
                }}
                className="font-medium text-primary hover:underline"
              >
                {isLogin ? "Register" : "Sign in"}
              </button>
            </div>

            {/* Legal */}
            <p className="text-xs text-center text-muted-foreground">
              This is a secure clinical environment. Unauthorized access is strictly
              prohibited and subject to legal action. By signing in, you agree to our{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
              .
            </p>

            {/* Status */}
            <div className="flex items-center justify-center gap-2 text-sm text-success">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              SAFEMOTHER NODES ONLINE
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
