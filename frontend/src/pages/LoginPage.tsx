import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, Activity, ShieldPlus, HeartPulse, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import midwifeAuthImg from "@/assets/mid-wife-3.jpeg";

// Types
type UserRole = "midwife" | "patient" | "admin" | "doctor";

// Floating Input Component
interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ElementType;
}

const FloatingInput = ({ label, id, type, value, onChange, icon: Icon, required, ...props }: FloatingInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="relative w-full mb-5">
      <div 
        className={`relative flex items-center w-full border-b-2 transition-all duration-300 ${
          isFocused ? "border-teal-500 shadow-[0_2px_10px_rgba(20,184,166,0.1)]" : "border-gray-200 hover:border-gray-300"
        }`}
      >
        {Icon && (
          <Icon className={`h-5 w-5 mr-3 transition-colors duration-300 ${isFocused ? "text-teal-500" : "text-gray-400"}`} />
        )}
        <div className="relative flex-1 h-14">
          <input
            id={id}
            type={isPassword && showPassword ? "text" : type}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            required={required}
            className="peer w-full h-full bg-transparent pt-4 pb-1 outline-none text-gray-800 placeholder-transparent text-sm"
            placeholder={label}
            {...props}
          />
          <label
            htmlFor={id}
            className={`absolute left-0 cursor-text transition-all duration-300 pointer-events-none ${
              isFocused || value
                ? "top-1 text-[11px] text-teal-600 font-semibold tracking-wider uppercase"
                : "top-4 text-sm text-gray-500"
            }`}
          >
            {label}
          </label>
        </div>
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="ml-2 p-1 text-gray-400 hover:text-teal-600 focus:outline-none transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(location.pathname !== "/register");
  
  // Update state when URL changes directly
  useEffect(() => {
    setIsLogin(location.pathname !== "/register");
    setErrorMessage(""); // clear errors on switch
  }, [location.pathname]);

  const [selectedRole, setSelectedRole] = useState<UserRole>("midwife");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [assignedArea, setAssignedArea] = useState("");
  const [qualification, setQualification] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialization, setSpecialization] = useState("Maternal-Fetal Medicine Specialists");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Login API Call
        const response = await fetch(`${API_BASE_URL}/api/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("Logged in successfully");
          localStorage.setItem("userInfo", JSON.stringify(data));

          if (data.role === "midwife") navigate("/midwife");
          else if (data.role === "patient") navigate("/patient");
          else if (data.role === "doctor") navigate("/doctor");
          else navigate("/admin");
        } else {
          const errMsg = data.message || "Invalid email or password. Please try again.";
          setErrorMessage(errMsg);
          toast.error(errMsg);
        }
      } else {
        // Register API Call
        const response = await fetch(`${API_BASE_URL}/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify({
            name,
            email,
            password,
            role: selectedRole,
            contact_number: contactNumber,
            assigned_area: assignedArea,
            qualification,
            experience_years: Number(experienceYears),
            hospital_name: hospitalName,
            license_number: licenseNumber,
            specialization,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("Registration successful! Please login.");
          navigate("/login");
          setPassword(""); 
        } else {
          const errMsg = data.message || "Registration failed. Please try again.";
          setErrorMessage(errMsg);
          toast.error(errMsg);
        }
      }
    } catch (error) {
      setErrorMessage("Connection error. Please check your network and try again.");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
  };

  // Switch to sign up mode and scroll to top
  const toggleMode = () => {
    const nextPath = isLogin ? "/register" : "/login";
    navigate(nextPath, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#f4fbfc] overflow-x-hidden font-sans relative">
      
      {/* Background Subtle Animations (Full Page) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-teal-300/20 rounded-full blur-[80px]"
        />
        <motion.div
          animate={{ y: [0, 40, 0], x: [0, -20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-300/15 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-200/20 rounded-full blur-[60px]"
        />
      </div>

      {/* Left Panel - Branding & Illustration */}
      <div className="hidden lg:flex flex-col justify-between p-12 z-10 relative">
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-xl overflow-hidden shadow-md bg-white border border-teal-100 p-1">
            <img src="/logo.jpeg" alt="SafeMother Logo" className="w-full h-full object-contain rounded-lg" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-teal-900">SafeMother</span>
        </motion.div>

        <div className="flex-1 flex items-center justify-center w-full px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="max-w-md relative"
          >
            {/* Decorative background shape behind image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-teal-400 to-sky-300 rounded-[3rem] transform rotate-3 scale-105 opacity-20 blur-lg animate-pulse" />
            
            <img
              src={midwifeAuthImg}
              alt="Maternal care illustration"
              className="w-full relative z-10 object-cover aspect-square rounded-[2rem] shadow-2xl border-8 border-white/80"
            />
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-10 relative z-10"
            >
              <h2 className="text-4xl font-bold text-teal-950 leading-tight">
                Welcome Back to <br/> <span className="text-teal-600">SafeMother</span>
              </h2>
              <p className="mt-4 text-teal-800/80 text-lg leading-relaxed font-medium">
                Supporting mothers with safe, smart, and compassionate clinical care.
              </p>

              <div className="flex gap-4 mt-8 flex-wrap">
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/60 backdrop-blur-md shadow-sm border border-white text-sm font-semibold text-teal-800 hover:bg-white/80 transition-colors">
                  <ShieldPlus className="h-5 w-5 text-teal-600" />
                  Secure Protocol
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/60 backdrop-blur-md shadow-sm border border-white text-sm font-semibold text-teal-800 hover:bg-white/80 transition-colors">
                  <HeartPulse className="h-5 w-5 text-rose-500" />
                  Maternal Care
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-sm font-medium text-teal-700/60"
        >
          © {new Date().getFullYear()} SAFEMOTHER | CLINICAL PLATFORM
        </motion.p>
      </div>

      {/* Right Panel - Login/Register Form Card */}
      <div className="flex flex-col justify-center items-center p-6 lg:p-12 z-10">
        
        {/* Mobile Header & Illustration */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="lg:hidden flex flex-col items-center gap-4 mb-8 w-full max-w-[480px]"
        >
          <div className="flex items-center gap-3 w-full self-start">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden shadow-md bg-white border border-teal-100 p-1">
              <img src="/logo.jpeg" alt="SafeMother Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-teal-900">SafeMother</span>
          </div>
          <div className="w-full aspect-[2/1] rounded-2xl overflow-hidden shadow-lg border-4 border-white relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-tr from-teal-400/20 to-sky-300/20 backdrop-blur-[2px] z-10" />
            <img 
              src={midwifeAuthImg}
              alt="Maternal care illustration"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Form Container */}
        <motion.div 
          key={isLogin ? 'login' : 'register'}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full max-w-[480px] bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? "Sign In" : "Create Account"}
            </h1>
            <p className="text-gray-500 font-medium">
              {isLogin 
                ? "Enter your credentials to access your portal" 
                : "Join our healthcare platform to get started"}
            </p>
          </div>

          <AnimatePresence>
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-red-50 text-red-600 border border-red-200 text-sm p-3 rounded-xl flex items-center gap-2 overflow-hidden"
              >
                <Activity className="h-4 w-4 shrink-0" />
                <p>{errorMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAuth} className="space-y-2">
            
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 space-y-4"
              >
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                    I am registering as:
                  </label>
                  <div className="mt-2 flex gap-3">
                    {["midwife", "doctor"].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role as UserRole)}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 capitalize border ${
                          selectedRole === role
                            ? "bg-teal-50 text-teal-700 border-teal-300 shadow-sm shadow-teal-100"
                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <FloatingInput
                  id="name"
                  type="text"
                  label="Full Name"
                  icon={User}
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  required={!isLogin}
                />

                {selectedRole === 'midwife' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0">
                    <FloatingInput id="contact" type="text" label="Contact Number" value={contactNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContactNumber(e.target.value)} required />
                    <FloatingInput id="qualification" type="text" label="Qualification" value={qualification} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQualification(e.target.value)} />
                    <FloatingInput id="experience" type="number" label="Experience (Years)" value={experienceYears} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExperienceYears(e.target.value)} />
                    <FloatingInput id="hospital" type="text" label="Hospital Appt." value={hospitalName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHospitalName(e.target.value)} />
                  </div>
                )}

                {selectedRole === 'doctor' && (
                  <div className="grid grid-cols-1 gap-0">
                    <FloatingInput id="license" type="text" label="Medical License Number" value={licenseNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLicenseNumber(e.target.value)} required />
                    <div className="relative border-b-2 border-gray-200 hover:border-gray-300 transition-all duration-300 mb-5 pb-1">
                      <select 
                        id="specialization"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full bg-transparent pt-4 pb-2 text-sm text-gray-800 outline-none appearance-none cursor-pointer"
                      >
                         <option value="Maternal-Fetal Medicine Specialists">Maternal-Fetal Medicine Specialists</option>
                         <option value="Obstetrician-Gynecologist">Obstetrician-Gynecologist</option>
                         <option value="Neonatologist">Neonatologist</option>
                         <option value="General Physician">General Physician</option>
                      </select>
                      <label className="absolute left-0 cursor-text -top-1 text-[11px] text-teal-600 font-semibold tracking-wider uppercase pointer-events-none">
                        Primary Specialization
                      </label>
                    </div>
                    <FloatingInput id="hospital-doc" type="text" label="Hospital / Clinic Name" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} required />
                  </div>
                )}
              </motion.div>
            )}

            <FloatingInput
              id="email"
              type="email"
              label="Email Address"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <FloatingInput
              id="password"
              type="password"
              label="Password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {isLogin && (
              <div className="flex items-center justify-between mb-8 mt-2 pl-1 text-sm">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" className="border-gray-300 text-teal-600 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600 rounded" />
                  <label htmlFor="remember" className="font-medium text-gray-600 cursor-pointer">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="font-semibold text-teal-600 hover:text-teal-800 transition-colors">
                  Forgot Password?
                </Link>
              </div>
            )}

            <div className="mt-8 pt-4">
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  type="submit" 
                  className={`w-full py-6 text-base font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                    isLoading 
                      ? "bg-teal-400 hover:bg-teal-400 cursor-not-allowed opacity-80" 
                      : "bg-teal-600 hover:bg-teal-700 hover:-translate-y-0.5"
                  }`} 
                  size="lg" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    isLogin ? "Login to Dashboard" : "Complete Registration"
                  )}
                </Button>
              </motion.div>
            </div>

            {/* Toggle Login/Register */}
            <div className="text-center mt-8 text-sm font-medium text-gray-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-teal-600 font-bold hover:text-teal-800 hover:underline transition-colors"
              >
                {isLogin ? "Register Now" : "Sign In"}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </div>
  );
}
