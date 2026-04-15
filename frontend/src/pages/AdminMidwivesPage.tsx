import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { 
  Stethoscope, Plus, Search, MapPin, Users,
  Award, Clock, Building2, MoreHorizontal,
  Mail, Phone, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function AdminMidwivesPage() {
  const [midwives, setMidwives] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMidwives = async () => {
    try {
      const response = await fetch(`http://${window.location.hostname}:5001/api/admin/midwives`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMidwives(data);
      }
    } catch (err) {
      toast.error("Failed to load midwives");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMidwives();
  }, []);

  const filteredMidwives = midwives.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.hospital_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.assigned_area?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar variant="admin" />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header title="Midwife Directory" subtitle="Manage clinical staff and area assignments" />

        <main className="flex-1 overflow-auto p-8 bg-muted/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, hospital or area..."
                className="pl-10 h-12 rounded-2xl bg-card border-none shadow-sm font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="h-12 px-6 rounded-2xl font-bold gap-2">
              <Plus className="h-5 w-5" />
              Register New Midwife
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
               Array(6).fill(0).map((_, i) => <div key={i} className="h-64 rounded-3xl bg-muted animate-pulse" />)
            ) : filteredMidwives.length === 0 ? (
               <div className="col-span-full h-64 flex flex-col items-center justify-center text-muted-foreground italic">
                  <Stethoscope className="h-12 w-12 mb-4 opacity-20" />
                  <p>No midwives found in the registry</p>
               </div>
            ) : (
              filteredMidwives.map((midwife) => (
                <Card key={midwife._id} className="border-none shadow-xl bg-card rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 group">
                   <CardContent className="p-0">
                      {/* Card Header Color Strip */}
                      <div className="h-24 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 relative">
                         <div className="absolute top-4 right-4 text-white/50 hover:text-white cursor-pointer transition-colors">
                            <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                  <MoreHorizontal className="h-6 w-6" />
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end" className="rounded-xl p-2 w-48 shadow-2xl">
                                  <DropdownMenuItem className="gap-2 font-bold cursor-pointer">
                                     <MapPin className="h-4 w-4 text-primary" />
                                     Reassign Area
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2 font-bold cursor-pointer">
                                     <Users className="h-4 w-4 text-primary" />
                                     View Patients
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2 font-bold cursor-pointer text-emergency">
                                     <Clock className="h-4 w-4" />
                                     Deactivate
                                  </DropdownMenuItem>
                               </DropdownMenuContent>
                            </DropdownMenu>
                         </div>
                      </div>

                      <div className="px-6 pb-6 relative">
                         {/* Avatar overlapping the header */}
                         <div className="absolute -top-12 left-6">
                            <Avatar className="h-20 w-20 border-4 border-card shadow-xl">
                               {midwife.hasProfilePhoto && (
                                 <AvatarImage src={`http://${window.location.hostname}:5001/api/users/profile-photo/${midwife.user_id?._id}`} />
                               )}
                               <AvatarFallback className="bg-indigo-100 text-indigo-600 text-2xl font-black">
                                  {midwife.name.charAt(0)}
                               </AvatarFallback>
                            </Avatar>
                         </div>

                         <div className="pt-10">
                            <h3 className="text-lg font-black tracking-tight text-foreground">{midwife.name}</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                               <Building2 className="h-3 w-3 text-muted-foreground" />
                               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">
                                  {midwife.hospital_name || "Unassigned Hospital"}
                               </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                               <div className="space-y-1">
                                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Assigned Area</p>
                                  <div className="flex items-center gap-1 text-sm font-bold text-primary">
                                     <MapPin className="h-3.5 w-3.5" />
                                     {midwife.assigned_area || "N/A"}
                                  </div>
                               </div>
                               <div className="space-y-1">
                                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Experience</p>
                                  <div className="flex items-center gap-1 text-sm font-bold text-foreground">
                                     <Award className="h-3.5 w-3.5 text-amber-500" />
                                     {midwife.experience_years ? `${midwife.experience_years} Years` : "New Registry"}
                                  </div>
                               </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-muted/50 flex items-center justify-between">
                               <div className="flex gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                                     <Mail className="h-4 w-4" />
                                  </div>
                                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                                     <Phone className="h-4 w-4" />
                                  </div>
                               </div>
                               <Button variant="ghost" size="sm" className="font-bold text-xs gap-1 group-hover:bg-primary group-hover:text-white transition-all rounded-xl">
                                  Portfolio
                                  <ExternalLink className="h-3 w-3" />
                               </Button>
                            </div>
                         </div>
                      </div>
                   </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
