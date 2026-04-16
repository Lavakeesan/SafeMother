import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Shield, 
  CheckCircle, 
  Users, 
  BookOpen, 
  AlertTriangle, 
  ArrowRight, 
  Lock, 
  Cloud, 
  Clock, 
  Stethoscope,
  Heart,
  Calendar,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Star,
  Quote,
  Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNavbar } from "@/components/PublicNavbar";
import useEmblaCarousel from 'embla-carousel-react';
import heroModern from "@/assets/hero-modern.png";
import midwifeImg from "@/assets/mid-wife.jpg";

export default function LandingPage() {
  const [emblaRef] = useEmblaCarousel({ 
    loop: true,
    align: 'start',
    slidesToScroll: 1
  });

  const features = [
    {
      icon: Users,
      title: "Patient Monitoring",
      description: "Real-time health tracking and vital monitoring for expectant mothers.",
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      icon: Stethoscope,
      title: "Midwife Support",
      description: "Smart guidance tools and digital records for clinical excellence.",
      color: "bg-teal-500/10 text-teal-500"
    },
    {
      icon: MessageSquare,
      title: "Doctor Consultation",
      description: "Instant secure communication channels between patients and physicians.",
      color: "bg-indigo-500/10 text-indigo-500"
    },
    {
      icon: AlertTriangle,
      title: "Emergency Alerts",
      description: "Priority notification system for high-risk maternal health scenarios.",
      color: "bg-orange-500/10 text-orange-600"
    }
  ];

  const steps = [
    { title: "Register", desc: "Create your clinical profile in seconds." },
    { title: "Connect", desc: "Link with your assigned care team." },
    { title: "Track", desc: "Monitor pregnancy milestones and vitals." },
    { title: "Advice", desc: "Receive real-time medical guidance safely." }
  ];

  const testimonials = [
    { 
      name: "Sarah Johnson", 
      role: "Patient", 
      content: "SafeMother gave me peace of mind throughout my pregnancy. Knowing my midwife is just a chat away was everything.",
      avatar: "SJ"
    },
    { 
      name: "Dr. Elena Rodriguez", 
      role: "Obstetrician", 
      content: "The coordination between my patients and the clinical team has never been smoother. A game-changer for maternal health.",
      avatar: "ER"
    },
    { 
      name: "Mary Mwangi", 
      role: "Midwife", 
      content: "Managing high-risk cases is much more structured now. The emergency alerts have literally saved lives in our clinic.",
      avatar: "MM"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/4" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-8 border border-primary/10 animate-fade-in">
                <Heart className="h-3.5 w-3.5 fill-primary" />
                Trusted by 500+ Clinics Worldwide
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight mb-8">
                Ensuring Safe Motherhood <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Through Smart Digital Care</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl font-medium">
                Connecting pregnant mothers, midwives, and doctors for better maternal health. 
                Experience a new standard of coordinated clinical excellence.
              </p>
              <div className="flex flex-wrap gap-5">
                <Link to="/register">
                  <Button size="lg" className="h-16 px-10 rounded-2xl text-lg font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 transition-all hover:scale-105 active:scale-95 group">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl text-lg font-bold border-2 hover:bg-white/50 transition-all border-slate-200">
                    Login to Portal
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative animate-fade-in delay-300">
               <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-premium border-8 border-white animate-float bg-white">
                  <img src={heroModern} alt="Healthcare Illustration" className="w-full h-auto object-cover" />
               </div>
               {/* Floating Stats */}
               <div className="absolute -top-6 -right-6 bg-white p-6 rounded-3xl shadow-xl z-20 animate-slide-up delay-400 border border-slate-100">
                  <p className="text-3xl font-black text-primary leading-none">99.8%</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Recovery Rate</p>
               </div>
               <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-xl z-20 animate-slide-up delay-500 border border-slate-100 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shadow-inner">
                    <ShieldCheck className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-base font-black text-slate-900 leading-tight">Secure & Private</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-0.5">HIPAA Compliant</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
           <div className="text-center mb-20 animate-slide-up">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-4">Powerful Ecosystem</h2>
              <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Designed for the frontline of maternal care</h3>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, i) => (
                <div key={i} className="group p-10 rounded-[2.5rem] bg-slate-50 hover:bg-white border-2 border-transparent hover:border-primary/10 transition-all duration-500 shadow-soft hover:shadow-premium animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                   <div className={`h-16 w-16 rounded-[1.25rem] ${feature.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm`}>
                      <feature.icon className="h-8 w-8" />
                   </div>
                   <h4 className="text-xl font-black text-slate-900 mb-4 tracking-tight leading-tight">{feature.title}</h4>
                   <p className="text-slate-500 font-medium leading-relaxed">{feature.description}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 bg-slate-50/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center mb-16 animate-slide-up">
           <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-4">Patient Journey</h2>
           <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Your path to a safe delivery</h3>
        </div>

        <div className="max-w-5xl mx-auto px-6 lg:px-8">
           <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {/* Timeline Line */}
              <div className="hidden lg:block absolute top-[50%] left-[10%] right-[10%] h-0.5 bg-slate-200 -z-0" />
              
              {steps.map((step, i) => (
                <div key={i} className="relative z-10 text-center space-y-4 animate-slide-up" style={{ animationDelay: `${i * 150}ms` }}>
                   <div className="h-24 w-24 rounded-[2rem] bg-white border-[6px] border-slate-50 shadow-premium flex items-center justify-center mx-auto text-3xl font-black text-primary mb-6 transition-transform hover:scale-110 group cursor-default">
                      <span className="group-hover:animate-bounce">0{i + 1}</span>
                   </div>
                   <h5 className="text-xl font-black text-slate-900 tracking-tight">{step.title}</h5>
                   <p className="text-sm font-medium text-slate-400 leading-relaxed px-4">{step.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* About Section */}
      <section id="impact" className="py-32 overflow-hidden bg-white">
         <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-20 items-center">
               <div className="lg:w-1/2 relative animate-fade-in">
                  <div className="relative p-6 bg-primary/5 rounded-[4rem] group max-w-lg mx-auto lg:max-w-none">
                    <img src={midwifeImg} alt="About SafeMother" className="rounded-[3.5rem] shadow-premium transition-transform duration-700 group-hover:scale-[1.02] aspect-[4/5] object-cover" />
                    <div className="absolute -bottom-10 -right-6 lg:-right-10 bg-white p-8 rounded-[2rem] shadow-premium border flex items-center gap-5 animate-slide-up delay-300">
                       <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary/30">
                          10+
                       </div>
                       <div>
                          <p className="font-black text-slate-900 leading-none">Years of Research</p>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mt-2">In Clinical Care</p>
                       </div>
                    </div>
                  </div>
               </div>
               <div className="lg:w-1/2 animate-slide-up delay-200">
                  <div className="flex flex-col items-center lg:items-start">
                    <h2 className="text-xs font-black uppercase tracking-[0.3rem] text-primary mb-6">Improving Outcomes</h2>
                    <h3 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-10 text-center lg:text-left">
                       Reducing maternal & <br className="hidden lg:block" /> newborn mortality.
                    </h3>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed mb-12 text-center lg:text-left max-w-xl">
                       SafeMother is more than a tool; it's a mission to digitalize maternal healthcare. By linking patients directly with specialized clinicians, we ensure that every pregnancy receives the oversight it deserves.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-8 mb-12 w-full max-w-lg">
                       <div className="p-8 rounded-[2.5rem] bg-slate-50 shadow-soft border border-black/5 flex flex-col items-center lg:items-start group hover:bg-primary transition-colors hover:border-primary duration-500">
                          <p className="text-4xl font-black text-primary mb-2 group-hover:text-white transition-colors">95%</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white/70 transition-colors">Response Speed</p>
                       </div>
                       <div className="p-8 rounded-[2.5rem] bg-slate-50 shadow-soft border border-black/5 flex flex-col items-center lg:items-start group hover:bg-primary transition-colors hover:border-primary duration-500">
                          <p className="text-4xl font-black text-primary mb-2 group-hover:text-white transition-colors">24/7</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white/70 transition-colors">Active Monitoring</p>
                       </div>
                    </div>
                    <div>
                      <Link to="/register">
                          <Button variant="ghost" className="h-16 px-10 rounded-full font-black text-primary border-2 border-primary/20 hover:bg-primary/5 gap-3 group">
                              Our Impact Story
                              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                          </Button>
                      </Link>
                    </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 bg-slate-950 text-white overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--primary)_0%,_transparent_50%)]" />
         </div>
         
         <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            <div className="text-center mb-24 animate-slide-up">
               <h3 className="text-4xl lg:text-6xl font-black tracking-tight mb-6">Trusted by the community</h3>
               <p className="text-slate-400 text-xl font-medium">Voices from the clinical frontline and growing families</p>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
               <div className="flex -ml-4">
                  {testimonials.map((t, i) => (
                    <div key={i} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4">
                       <div className="h-full p-10 rounded-[3rem] bg-white/5 border border-white/10 flex flex-col justify-between backdrop-blur-xl shadow-2xl transition-all hover:bg-white/10 group cursor-default">
                          <div>
                             <Quote className="h-12 w-12 text-primary mb-10 opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                             <p className="text-xl font-medium leading-relaxed italic text-slate-200 mb-10">"{t.content}"</p>
                          </div>
                          <div className="flex items-center gap-5">
                             <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-primary/20">
                                {t.avatar}
                             </div>
                             <div>
                                <p className="font-black text-xl leading-none">{t.name}</p>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-2">{t.role}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden bg-white">
         <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="relative rounded-[4rem] bg-gradient-to-br from-primary via-primary to-blue-600 p-12 lg:p-28 overflow-hidden shadow-premium text-center">
               <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:40px_40px]" />
               </div>
               
               <div className="relative z-10 animate-slide-up">
                  <h2 className="text-4xl lg:text-7xl font-black text-white tracking-tight leading-[1] mb-10">
                     Start Your Safe Motherhood <br /> Journey Today
                  </h2>
                  <p className="text-white/80 text-xl lg:text-2xl font-medium mb-14 max-w-2xl mx-auto leading-relaxed">
                     Join thousands of families and practitioners who have transformed maternal care with SafeMother's clinical network.
                  </p>
                  <div className="flex flex-wrap justify-center gap-6">
                     <Link to="/register">
                        <Button className="h-20 px-12 rounded-[2.25rem] bg-white text-primary text-2xl font-black hover:bg-slate-50 shadow-2xl transition-all hover:scale-105 active:scale-95 group">
                           Register Now
                           <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
                        </Button>
                     </Link>
                     <Button className="h-20 px-12 rounded-[2.25rem] border-2 border-white/30 bg-transparent text-white text-2xl font-black hover:bg-white/10 shadow-2xl transition-all">
                        Contact Sales
                     </Button>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t bg-slate-50/30">
         <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-20 mb-20">
               <div className="col-span-2">
                  <Link to="/" className="flex items-center gap-4 mb-10">
                    <div className="h-14 w-14 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-premium bg-white">
                       <img src="/logo.jpeg" alt="Logo" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h4 className="font-black text-3xl tracking-tighter text-slate-900 leading-none">SafeMother</h4>
                        <p className="text-[11px] font-black tracking-[0.25em] text-primary uppercase mt-1.5 opacity-80">Clinical Oversight Network</p>
                    </div>
                  </Link>
                  <p className="text-xl font-medium text-slate-500 max-w-sm leading-relaxed mb-10">
                     Ensuring clinical excellence and safety for mothers and newborns through innovative digital healthcare solutions.
                  </p>
                  <div className="flex gap-4">
                     {["Twitter", "LinkedIn", "Instagram", "Facebook"].map(platform => (
                        <div key={platform} className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer border-2 border-slate-100 shadow-soft group">
                           <Shield className="h-5 w-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                        </div>
                     ))}
                  </div>
               </div>

               <div>
                  <h6 className="font-black text-slate-900 uppercase tracking-[0.3em] text-[10px] mb-10">System Architecture</h6>
                  <ul className="space-y-5">
                     {["Clinical Monitoring", "Risk Assessment", "Specialist Portal", "Patient Experience"].map(l => (
                        <li key={l}><a href="#" className="text-slate-500 font-bold hover:text-primary transition-colors hover:translate-x-1 inline-block">{l}</a></li>
                     ))}
                  </ul>
               </div>

               <div>
                  <h6 className="font-black text-slate-900 uppercase tracking-[0.3em] text-[10px] mb-10">Legal & Trust</h6>
                  <ul className="space-y-5">
                     {["Security Standards", "Privacy Policy", "Data Processing", "Clinical Standards"].map(l => (
                        <li key={l}><a href="#" className="text-slate-500 font-bold hover:text-primary transition-colors hover:translate-x-1 inline-block">{l}</a></li>
                     ))}
                  </ul>
               </div>
            </div>

            <div className="pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
               <p className="text-sm font-black text-slate-400">© 2024 SafeMother Technologies. All clinical data encrypted via AES-256.</p>
               <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm animate-fade-in">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <p className="text-[10px] font-black tracking-[0.1em] text-emerald-600 uppercase">Specialist Network: Live & Secure</p>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}
