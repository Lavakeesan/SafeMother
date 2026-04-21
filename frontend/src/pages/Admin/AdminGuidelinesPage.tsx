import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { 
  BookOpen, Plus, Search, FileText, 
  Edit2, Trash2, MoreVertical, Bookmark,
  Calendar, CheckCircle2, History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";


export default function AdminGuidelinesPage() {
  const [guidelines, setGuidelines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGuideline, setEditingGuideline] = useState<any>(null);
  const [formData, setFormData] = useState({ title: "", description: "" });

  const fetchGuidelines = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/guidelines`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setGuidelines(data);
      }
    } catch (err) {
      toast.error("Failed to load guidelines");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuidelines();
  }, []);

  const handleSave = async () => {
    try {
      const url = editingGuideline 
        ? `${API_BASE_URL}/api/guidelines/${editingGuideline._id}`
        : `${API_BASE_URL}/api/guidelines`;
      
      const method = editingGuideline ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(`Guideline ${editingGuideline ? 'updated' : 'created'} successfully`);
        setIsDialogOpen(false);
        fetchGuidelines();
      }
    } catch (err) {
      toast.error("Error saving guideline");
    }
  };

  const filteredGuidelines = guidelines.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar variant="admin" />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header title="Clinical Guidelines" subtitle="Knowledge base for maternal care protocols and advisory" />

        <main className="flex-1 overflow-auto p-8 bg-muted/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search protocols by title or clinical tags..." 
                className="pl-10 h-12 rounded-2xl bg-card border-none shadow-sm font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button 
                onClick={() => { setEditingGuideline(null); setFormData({title: "", description:""}); setIsDialogOpen(true); }}
                className="h-12 px-6 rounded-2xl font-bold gap-2"
            >
              <Plus className="h-5 w-5" />
              New Protocol
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {isLoading ? (
               Array(4).fill(0).map((_, i) => <div key={i} className="h-64 rounded-3xl bg-muted animate-pulse" />)
            ) : filteredGuidelines.length === 0 ? (
               <div className="col-span-full h-80 flex flex-col items-center justify-center text-muted-foreground italic">
                  <BookOpen className="h-16 w-16 mb-4 opacity-10" />
                  <p className="text-xl font-medium">No medical guidelines found</p>
                  <p className="text-sm">Start by creating a new clinical protocol</p>
               </div>
            ) : (
              filteredGuidelines.map((guideline) => (
                <Card key={guideline._id} className="border-none shadow-xl bg-card rounded-[2.5rem] overflow-hidden group">
                   <CardHeader className="p-8 pb-4">
                      <div className="flex items-start justify-between">
                         <div className="bg-primary/10 p-4 rounded-3xl mb-4">
                            <FileText className="h-8 w-8 text-primary" />
                         </div>
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => { setEditingGuideline(guideline); setFormData({title: guideline.title, description: guideline.description}); setIsDialogOpen(true); }}
                         >
                            <Edit2 className="h-5 w-5 text-muted-foreground" />
                         </Button>
                      </div>
                      <CardTitle className="text-2xl font-black tracking-tight">{guideline.title}</CardTitle>
                      <CardDescription className="text-sm font-medium pt-2 line-clamp-3 leading-relaxed">
                         {guideline.description}
                      </CardDescription>
                   </CardHeader>
                   <CardContent className="p-8 pt-4">
                      <div className="flex items-center justify-between pt-6 border-t border-muted/50">
                         <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                               <Calendar className="h-3.5 w-3.5" />
                               Update: {new Date(guideline.updatedAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-success uppercase tracking-widest">
                               <CheckCircle2 className="h-3.5 w-3.5" />
                               Validated
                            </div>
                         </div>
                         <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full border-2 border-card bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600">JB</div>
                            <div className="w-8 h-8 rounded-full border-2 border-card bg-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-600">SM</div>
                         </div>
                      </div>
                   </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl rounded-[2.5rem] p-10 border-none shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5">
             <BookOpen className="h-48 w-48 -mr-16 -mt-16" />
          </div>
          
          <DialogHeader className="mb-8 items-start text-left">
            <div className="bg-primary/10 p-4 rounded-2xl mb-4">
               <Bookmark className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight">
               {editingGuideline ? "Refine Clinical Protocol" : "Authorize New Guideline"}
            </DialogTitle>
            <p className="text-muted-foreground font-medium pt-1">
               Ensure all entries follow the latest WHO standards for maternal healthcare.
            </p>
          </DialogHeader>

          <div className="space-y-8 relative z-10">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Protocol Title</Label>
              <Input 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Antenatal Care for Low-Risk Pregnancies"
                className="h-14 rounded-2xl bg-muted/50 border-none px-6 font-bold text-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Detailed Clinical Advisory</Label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the clinical steps, observations and recommended guidance..."
                className="min-h-[200px] rounded-2xl bg-muted/50 border-none p-6 font-medium text-base resize-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter className="mt-12 gap-4 sm:justify-end">
            <Button 
                variant="ghost" 
                onClick={() => setIsDialogOpen(false)}
                className="h-14 rounded-2xl font-black uppercase tracking-widest px-8"
            >
              Discard
            </Button>
            <Button 
                onClick={handleSave} 
                className="h-14 rounded-2xl font-black uppercase tracking-widest px-10 bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
            >
              {editingGuideline ? "Update Protocol" : "Publish Guideline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
