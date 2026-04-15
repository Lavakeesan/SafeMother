import { Link, useNavigate } from "react-router-dom";
import { Bell, MessageSquare, Search, Plus, User, Settings, LogOut, ShieldCheck, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  showRegisterPatient?: boolean;
  onRegisterPatient?: () => void;
}

export function Header({ title, subtitle, showSearch = false, showRegisterPatient = false, onRegisterPatient }: HeaderProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact_number: "",
    assigned_area: "",
    qualification: "",
    experience_years: "",
    hospital_name: ""
  });

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  const fetchProfile = async () => {
    setIsFetchingProfile(true);
    try {
      const response = await fetch(`http://${window.location.hostname}:5001/api/users/profile`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          contact_number: data.profile?.contact_number || "",
          assigned_area: data.profile?.assigned_area || "",
          qualification: data.profile?.qualification || "",
          experience_years: data.profile?.experience_years?.toString() || "",
          hospital_name: data.profile?.hospital_name || ""
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      // 1. Update Profile Photo if selected
      if (selectedFile) {
        const formDataPhoto = new FormData();
        formDataPhoto.append('photo', selectedFile);
        
        const photoResponse = await fetch(`http://${window.location.hostname}:5001/api/users/profile-photo`, {
          method: "POST",
          credentials: 'include',
          body: formDataPhoto,
        });
        
        if (!photoResponse.ok) {
           toast.error("Failed to upload profile photo");
        }
      }

      // 2. Update Basic Info
      const response = await fetch(`http://${window.location.hostname}:5001/api/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updated = await response.json();
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        localStorage.setItem("userInfo", JSON.stringify({
          ...userInfo,
          name: updated.name,
          email: updated.email
        }));
        setUser({ ...user, name: updated.name, email: updated.email });
        
        toast.success("Profile updated successfully");
        setIsEditModalOpen(false);
        setPreviewUrl(null);
        setSelectedFile(null);
        fetchProfile(); 
      } else {
        toast.error("Failed to update profile");
      }
    } catch (err) {
      toast.error("Error updating profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const profilePhotoUrl = user ? `http://${window.location.hostname}:5001/api/users/profile-photo/${user._id}?t=${Date.now()}` : "";

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-card border-b">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients, MRN, or symptoms..."
              className="w-80 pl-10 bg-muted/50 border-0"
            />
          </div>
        )}

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-emergency rounded-full" />
        </Button>

        <Button variant="ghost" size="icon">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
        </Button>

        {showRegisterPatient && (
          <Button onClick={onRegisterPatient} className="gap-2 bg-primary hover:bg-primary/90 text-white font-bold">
            <Plus className="h-4 w-4" />
            Register Patient
          </Button>
        )}

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border border-primary/10 hover:bg-primary/5 focus-visible:ring-primary overflow-hidden ml-2">
              <Avatar className="h-full w-full">
                <AvatarImage src={profilePhotoUrl} alt={user?.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 p-2 mr-8 mt-1 border shadow-xl rounded-xl" align="end">
            <DropdownMenuLabel className="p-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold text-foreground leading-none">{user?.name || "User"}</p>
                <p className="text-xs font-medium text-muted-foreground leading-none mt-1">{user?.email || user?.role}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => {
                setIsProfileModalOpen(true);
                fetchProfile();
              }}
              className="cursor-pointer gap-2 py-2.5 rounded-lg hover:bg-primary/5"
            >
              <User className="h-4 w-4 text-primary" />
              <span>View Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                setIsEditModalOpen(true);
                fetchProfile();
              }}
              className="cursor-pointer gap-2 py-2.5 rounded-lg hover:bg-primary/5"
            >
              <Settings className="h-4 w-4 text-primary" />
              <span>Edit Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 py-2.5 rounded-lg text-emergency bg-emergency/5 hover:bg-emergency/10">
              <LogOut className="h-4 w-4" />
              <span className="font-bold">Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Details Modal */}
        <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
            <div className="bg-primary p-8 text-white relative">
              <div className="absolute top-4 right-4 bg-white/20 p-2 rounded-full backdrop-blur-md">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 border-4 border-white/30 shadow-xl mb-4">
                   <AvatarImage src={profilePhotoUrl} />
                   <AvatarFallback className="text-3xl font-black bg-white text-primary">
                      {user?.name?.charAt(0)}
                   </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-black tracking-tight">{user?.name}</h2>
                <p className="text-primary-foreground/80 font-medium uppercase tracking-widest text-[10px] mt-1">
                  Verified {user?.role} Portal
                </p>
              </div>
            </div>

            <div className="p-8 bg-background">
              {isFetchingProfile ? (
                 <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                    <p className="text-sm font-medium text-muted-foreground italic">Fetching clinical credentials...</p>
                 </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Email Address</label>
                      <p className="text-sm font-bold text-foreground mt-0.5">{profileData?.email || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Contact Number</label>
                      <p className="text-sm font-bold text-foreground mt-0.5">{profileData?.profile?.contact_number || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Affiliated Hospital</label>
                      <p className="text-sm font-bold text-foreground mt-0.5">{profileData?.profile?.hospital_name || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Assigned Area</label>
                      <p className="text-sm font-bold text-foreground mt-0.5">{profileData?.profile?.assigned_area || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Qualifications</label>
                      <p className="text-sm font-bold text-foreground mt-0.5">{profileData?.profile?.qualification || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Experience</label>
                      <p className="text-sm font-bold text-foreground mt-0.5">{profileData?.profile?.experience_years ? `${profileData.profile.experience_years} Years` : "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 rounded-xl font-bold h-11"
                      onClick={() => setIsProfileModalOpen(false)}
                    >
                      Close
                    </Button>
                    <Button 
                      onClick={() => {
                        setIsProfileModalOpen(false);
                        setIsEditModalOpen(true);
                      }}
                      className="flex-1 rounded-xl bg-primary text-white font-bold h-11 shadow-lg shadow-primary/20"
                    >
                      Edit Profile
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Profile Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
             <div className="bg-primary/5 p-6 border-b border-primary/10 text-center relative">
                <DialogTitle className="text-xl font-bold text-primary">
                  Update Registry Profile
                </DialogTitle>
                <DialogDescription>Modify your professional details and photo.</DialogDescription>
                
                {/* Photo Upload Section */}
                <div className="mt-6 flex flex-col items-center">
                   <div className="relative group cursor-pointer" onClick={() => document.getElementById('photo-upload')?.click()}>
                      <Avatar className="h-28 w-28 border-4 border-white shadow-xl group-hover:opacity-80 transition-opacity">
                         <AvatarImage src={previewUrl || profilePhotoUrl} />
                         <AvatarFallback className="bg-primary/10 text-primary text-2xl font-black">
                            {user?.name?.charAt(0)}
                         </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                         <Camera className="text-white h-8 w-8" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white">
                         <Upload className="h-4 w-4" />
                      </div>
                   </div>
                   <input 
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                   />
                </div>
             </div>
             
             <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Full Name</Label>
                    <Input 
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="rounded-xl border-primary/10 focus-visible:ring-primary h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="rounded-xl border-primary/10 focus-visible:ring-primary h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Contact Number</Label>
                    <Input 
                      id="phone"
                      value={formData.contact_number}
                      onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                      className="rounded-xl border-primary/10 focus-visible:ring-primary h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="hospital" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Hospital</Label>
                    <Input 
                      id="hospital"
                      value={formData.hospital_name}
                      onChange={(e) => setFormData({...formData, hospital_name: e.target.value})}
                      className="rounded-xl border-primary/10 focus-visible:ring-primary h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="area" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Assigned Area</Label>
                    <Input 
                      id="area"
                      value={formData.assigned_area}
                      onChange={(e) => setFormData({...formData, assigned_area: e.target.value})}
                      className="rounded-xl border-primary/10 focus-visible:ring-primary h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="exp" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Experience (Years)</Label>
                    <Input 
                      id="exp"
                      type="number"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({...formData, experience_years: e.target.value})}
                      className="rounded-xl border-primary/10 focus-visible:ring-primary h-11"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="qual" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Qualifications</Label>
                    <Input 
                      id="qual"
                      value={formData.qualification}
                      onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                      className="rounded-xl border-primary/10 focus-visible:ring-primary h-11"
                      placeholder="e.g. B.Sc in Nursing, Midwifery Certification"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t flex gap-3">
                  <Button 
                    type="button"
                    variant="ghost" 
                    className="flex-1 rounded-xl font-bold h-12"
                    onClick={() => {
                        setIsEditModalOpen(false);
                        setPreviewUrl(null);
                        setSelectedFile(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 rounded-xl bg-primary text-white font-bold h-12 shadow-lg shadow-primary/20"
                  >
                    {isUpdating ? "Saving..." : "Update Profile"}
                  </Button>
                </div>
             </form>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
