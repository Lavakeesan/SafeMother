import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Paperclip, 
  Smile, 
  User, 
  CheckCheck,
  Clock,
  Navigation
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config";


export default function DoctorChatPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(userInfo);
    setCurrentUserId(user._id);
    if (user.role !== 'doctor' && user.role !== 'admin') {
      navigate("/login");
      return;
    }
    fetchChatPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient && selectedPatient.user_id) {
      fetchMessages(selectedPatient.user_id);
      // Setup polling or socket here in real app
      const interval = setInterval(() => fetchMessages(selectedPatient.user_id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedPatient]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const fetchChatPatients = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/doctor/patients`, {
        credentials: 'include'
      });
      const data = await resp.json();
      setPatients(data);
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
    if (!newMessage.trim() || !selectedPatient) return;

    setIsSending(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          receiverId: selectedPatient.user_id,
          message: newMessage
        })
      });

      if (resp.ok) {
        setNewMessage("");
        fetchMessages(selectedPatient.user_id);
      } else {
        toast.error("Failed to transmit message securely");
      }
    } catch (err) {
      toast.error("Network instability detected");
    } finally {
      setIsSending(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <Sidebar variant="doctor" />
      <div className="flex-1 flex flex-col h-screen">
        <Header title="Secure Messenger" subtitle="End-to-end encrypted clinical communication" />

        <div className="flex-1 flex bg-muted/20 overflow-hidden">
          {/* Chat List Sidebar */}
          <div className="w-80 border-r bg-card flex flex-col">
            <div className="p-4 border-b space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search chats..." 
                  className="pl-9 h-11 rounded-2xl bg-muted/50 border-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {isLoading ? (
                  <div className="p-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest italic animate-pulse">
                    Synchronizing...
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <div className="p-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest italic">
                    No active channels
                  </div>
                ) : filteredPatients.map((patient) => (
                  <div 
                    key={patient._id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                      selectedPatient?._id === patient._id 
                      ? "bg-primary/10 border-primary/10" 
                      : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="relative">
                       <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg border-2 ${
                          selectedPatient?._id === patient._id ? "bg-primary text-white border-primary" : "bg-muted text-foreground/50 border-transparent"
                       }`}>
                          {patient.name.charAt(0)}
                       </div>
                       <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-black truncate tracking-tight ${
                          selectedPatient?._id === patient._id ? "text-primary" : "text-foreground"
                        }`}>{patient.name}</p>
                        <span className="text-[9px] font-black text-muted-foreground uppercase">12:45 PM</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate font-medium">Click to open consultation channel</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-[#F0F2F5] dark:bg-zinc-950">
            {selectedPatient ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-3 bg-card border-b flex items-center justify-between shadow-sm relative z-10">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary border border-primary/20">
                        {selectedPatient.name.charAt(0)}
                     </div>
                     <div>
                        <p className="font-black text-foreground tracking-tight">{selectedPatient.name}</p>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                           Secure Session Active
                        </p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-xl">
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-xl">
                      <Video className="h-5 w-5" />
                    </Button>
                    <div className="w-px h-6 bg-muted mx-1" />
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-xl">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Messages Body */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-8 space-y-6"
                   style={{
                      backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
                   }}
                >
                  <div className="flex justify-center mb-8">
                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-sm border border-black/5">
                       Today, {new Date().toLocaleDateString()}
                    </div>
                  </div>

                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                      <MessageCircle className="h-16 w-16 mb-4" />
                      <p className="font-black uppercase tracking-widest text-xs">Clinical channel initialized</p>
                      <p className="text-[10px] font-bold mt-1">Start typing to begin consultation</p>
                    </div>
                  ) : messages.map((msg, idx) => {
                    const isMe = msg.sender === currentUserId;
                    return (
                      <div 
                        key={idx}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[70%] group relative ${
                          isMe
                          ? "bg-primary text-white rounded-2xl rounded-tr-none shadow-lg shadow-primary/20" 
                          : "bg-white dark:bg-zinc-900 border border-black/5 text-foreground rounded-2xl rounded-tl-none shadow-sm"
                        } p-4`}>
                          <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          <div className={`flex items-center justify-end gap-1.5 mt-2 opacity-70`}>
                            <span className="text-[9px] font-black uppercase">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                <div className="p-6 bg-card border-t shadow-2xl relative z-10">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-muted/30 p-2 rounded-[2rem] border border-muted focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <Button type="button" variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary shrink-0">
                      <Smile className="h-6 w-6" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary shrink-0">
                      <Paperclip className="h-6 w-6" />
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
                      placeholder="Type medical guidance or reply..."
                      className="flex-1 bg-transparent border-none outline-none py-3 text-sm font-medium h-12 max-h-32 resize-none"
                    />
                    <Button 
                      disabled={isSending || !newMessage.trim()}
                      className="h-10 w-10 shrink-0 rounded-full bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.1] active:scale-[0.9] transition-all flex items-center justify-center p-0"
                    >
                      {isSending ? (
                         <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                      ) : (
                         <Navigation className="h-5 w-5 fill-current rotate-45 mr-1" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
                <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center shadow-inner">
                   <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                      <Navigation className="h-12 w-12 text-primary rotate-45" />
                   </div>
                </div>
                <h2 className="text-2xl font-black tracking-tight mt-6">Secure Consultation Terminal</h2>
                <p className="text-muted-foreground max-w-sm font-medium">Select a patient from the encrypted directory on the left to initiate a private consultation channel.</p>
                <Badge variant="outline" className="mt-8 rounded-lg border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary gap-2 px-3 py-1.5">
                   <CheckCheck className="h-3 w-3" />
                   End-to-End Clinical Encryption
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

