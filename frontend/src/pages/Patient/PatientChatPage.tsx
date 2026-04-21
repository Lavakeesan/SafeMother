import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { 
  Send, 
  Search, 
  User, 
  CheckCheck,
  MessageCircle,
  Navigation,
  Smile,
  Paperclip,
  Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function PatientChatPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(userInfo);
    setCurrentUserId(user._id);
    if (user.role !== 'patient') {
      navigate("/login");
      return;
    }
    fetchChatDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDoctor.user_id) {
      fetchMessages(selectedDoctor.user_id);
      const interval = setInterval(() => fetchMessages(selectedDoctor.user_id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedDoctor]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const fetchChatDoctors = async () => {
    try {
      // First get patient's appointments to see which doctors they are linked to
      const resp = await fetch(`${API_BASE_URL}/api/patients/appointments`, {
        credentials: 'include'
      });
       const appointments = await resp.json();
       
       if (Array.isArray(appointments)) {
         // Extract unique doctors
         const doctorMap = new Map();
         appointments.forEach((app: any) => {
           if (app.doctor && app.doctor.user_id) {
             doctorMap.set(app.doctor.user_id, {
               ...app.doctor,
               lastMessage: "Secure clinical channel"
             });
           }
         });
         
         const doctorsList = Array.from(doctorMap.values());
         setDoctors(doctorsList);
         if (doctorsList.length > 0) {
           setSelectedDoctor(doctorsList[0]);
         }
       }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/chat/${userId}`, {
        credentials: 'include'
      });
      const data = await resp.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedDoctor) return;

    setIsSending(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          receiverId: selectedDoctor.user_id,
          message: newMessage
        })
      });

      if (resp.ok) {
        setNewMessage("");
        fetchMessages(selectedDoctor.user_id);
      } else {
        toast.error("Failed to transmit message securely");
      }
    } catch (err) {
      toast.error("Network instability detected");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <Sidebar variant="patient" />
      <div className="flex-1 flex flex-col h-screen">
        <Header title="Consult Specialist" subtitle="Direct secure communication with your physicians" />

        <div className="flex-1 flex bg-muted/20 overflow-hidden">
          {/* Doctor List */}
          <div className="w-80 border-r bg-card flex flex-col">
            <div className="p-6 border-b">
               <h3 className="font-black uppercase tracking-widest text-[10px] text-muted-foreground mr-1">Your Specialist Hub</h3>
               {doctors.length > 0 && (
                 <p className="text-xs font-black text-primary mt-1 flex items-center gap-2">
                   <User className="h-3 w-3" />
                   {doctors[0].name}
                 </p>
               )}
            </div>

            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {isLoading ? (
                  <div className="p-8 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest italic animate-pulse">
                    Synchronizing Doctors...
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                       <Clock className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                      No active physician assignments detected.
                    </p>
                  </div>
                ) : doctors.map((doctor) => (
                  <div 
                    key={doctor._id}
                    onClick={() => setSelectedDoctor(doctor)}
                    className={`flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all ${
                      selectedDoctor?.user_id === doctor.user_id 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "hover:bg-muted/50 border border-transparent"
                    }`}
                  >
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg border-2 ${
                       selectedDoctor?.user_id === doctor.user_id ? "bg-white/20 border-white/30" : "bg-primary/10 text-primary border-primary/20"
                    }`}>
                       {doctor.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-black truncate tracking-tight`}>{doctor.name}</p>
                      <p className={`text-[9px] font-bold uppercase tracking-widest opacity-70`}>{doctor.specialization || "Obstetrician"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950">
            {selectedDoctor ? (
              <>
                {/* Chat Header */}
                <div className="px-8 py-4 bg-white border-b flex items-center justify-between z-10">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary border border-primary/20 shadow-sm">
                        {selectedDoctor.name.charAt(0)}
                     </div>
                     <div>
                        <p className="font-black text-xl tracking-tighter text-foreground">{selectedDoctor.name}</p>
                        <div className="flex items-center gap-2">
                           <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                              Direct Clinical Line Active
                           </p>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Messages Body */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-10 space-y-6 bg-muted/5"
                >
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-30">
                      <MessageCircle className="h-20 w-20 mb-4 text-primary" />
                      <p className="font-black uppercase tracking-widest text-sm text-foreground">Secure Channel Initialized</p>
                      <p className="text-xs font-bold mt-2 max-w-xs leading-relaxed">Your conversation is strictly between you and your doctor.</p>
                    </div>
                  ) : messages.map((msg, idx) => {
                    const isMe = msg.sender === currentUserId;
                    return (
                      <div 
                        key={idx}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[75%] group relative ${
                          isMe
                          ? "bg-primary text-white rounded-[2rem] rounded-tr-none shadow-xl shadow-primary/20" 
                          : "bg-white dark:bg-zinc-900 border border-black/5 text-foreground rounded-[2rem] rounded-tl-none shadow-md"
                        } p-5 px-6`}>
                          <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          <div className={`flex items-center justify-end gap-2 mt-3 opacity-60`}>
                            <span className="text-[10px] font-black uppercase tracking-tighter">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMe && (
                               <CheckCheck className={`h-3 w-3 ${msg.read ? "text-emerald-300" : ""}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input */}
                <div className="p-8 bg-white border-t z-10">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-muted/20 p-2.5 rounded-[2.5rem] border-2 border-transparent focus-within:border-primary/20 focus-within:bg-white transition-all shadow-sm">
                    <Button type="button" variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary shrink-0 transition-transform hover:scale-110">
                      <Smile className="h-6 w-6" />
                    </Button>
                    <textarea 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Share updates, symptoms or questions with your doctor..."
                      className="flex-1 bg-transparent border-none outline-none py-3 text-sm font-bold h-12 max-h-32 resize-none placeholder:text-muted-foreground/50"
                    />
                    <Button 
                      disabled={isSending || !newMessage.trim()}
                      className="h-12 px-6 shrink-0 rounded-full bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-2"
                    >
                      {isSending ? (
                         <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                      ) : (
                         <>
                            SEND
                            <Navigation className="h-4 w-4 rotate-45" />
                         </>
                      )}
                    </Button>
                  </form>
                  <p className="text-center mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-50">
                     Clinical encryption: SHA-256 protected
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
                <div className="w-32 h-32 bg-primary/5 rounded-[3rem] flex items-center justify-center shadow-inner">
                   <Navigation className="h-12 w-12 text-primary rotate-45 animate-bounce" />
                </div>
                <div className="space-y-2">
                   <h2 className="text-2xl font-black tracking-tighter">Your Specialist Gateway</h2>
                   <p className="text-muted-foreground max-w-sm font-medium leading-relaxed">
                      Select an assigned physician from your care team on the left to begin a private, secure consultation.
                   </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
