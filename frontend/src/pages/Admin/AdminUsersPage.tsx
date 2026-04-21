import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { 
  Users, UserPlus, Search, Edit2, Trash2, 
  MoreVertical, Filter, ChevronLeft, ChevronRight,
  Shield, UserCog, Stethoscope, User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Add User States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient"
  });

  // Edit/Delete States
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "patient"
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else if (response.status === 403 || response.status === 401) {
        toast.error("Access Denied: You do not have administrative privileges.");
      } else {
        toast.error("Internal Server Error: Failed to retrieve user registry.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${selectedUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("User updated successfully");
        setIsEditDialogOpen(false);
        fetchUsers();
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${selectedUser._id}`, {
        method: "DELETE",
        credentials: 'include'
      });

      if (response.ok) {
        toast.success("User deleted successfully");
        setIsDeleteDialogOpen(false);
        fetchUsers();
      } else {
        toast.error("Delete failed");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(registerData)
      });

      if (response.ok) {
        toast.success("User account created successfully");
        setIsAddDialogOpen(false);
        setRegisterData({ name: "", email: "", password: "", role: "patient" });
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.message || "Registration failed");
      }
    } catch (err) {
      toast.error("Server communication error");
    } finally {
      setIsRegistering(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar variant="admin" />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header title="User Management" subtitle="Manage system administrators, midwives and patients" />

        <main className="flex-1 overflow-auto p-8 bg-muted/20">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-4 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name or email..." 
                  className="pl-10 h-12 rounded-2xl bg-card border-none shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-2xl shadow-sm border border-muted">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select 
                  className="bg-transparent text-sm font-bold outline-none"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="midwife">Midwives</option>
                  <option value="patient">Patients</option>
                </select>
              </div>
            </div>

            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="h-12 px-6 rounded-2xl font-bold gap-2 bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
            >
              <UserPlus className="h-5 w-5" />
              Add User
            </Button>
          </div>

          <div className="bg-card rounded-3xl border-none shadow-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-none">
                  <TableHead className="py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">User Identity</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">User ID</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Email Status</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">System Role</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Joined Date</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Last Update</TableHead>
                  <TableHead className="text-right py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell colSpan={7} className="h-16 bg-muted/10" />
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center text-muted-foreground font-medium italic">
                      No users found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id} className="group hover:bg-muted/10 border-muted/20 transition-colors">
                      <TableCell className="py-4 px-8">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className={`w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center font-bold ${
                              user.role === 'admin' ? 'bg-amber-100 text-amber-600' :
                              user.role === 'midwife' ? 'bg-indigo-100 text-indigo-600' :
                              'bg-primary/10 text-primary'
                            }`}>
                              {user.hasProfilePhoto && (
                                <img 
                                  src={`${API_BASE_URL}/api/users/profile-photo/${user._id}`} 
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              )}
                              <span className={user.hasProfilePhoto ? "hidden" : "flex items-center justify-center pointer-events-none"}>
                                {user.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="font-black text-sm leading-tight text-foreground">{user.name}</p>
                            <span className="text-[10px] font-bold text-success uppercase tracking-wider">Active</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-[10px] bg-muted px-2 py-1 rounded-lg font-mono text-muted-foreground">
                          {user._id.substring(0, 8)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-bold text-foreground">{user.email}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Verified Identity</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`rounded-xl border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 ${
                          user.role === 'admin' ? 'bg-amber-50 text-amber-600' :
                          user.role === 'midwife' ? 'bg-indigo-50 text-indigo-600' :
                          'bg-primary/5 text-primary'
                        }`}>
                          <RoleIcon role={user.role} />
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-muted-foreground italic">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-muted-foreground">
                        {new Date(user.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-8 flex items-center justify-end gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleEdit(user)}
                          className="h-9 px-4 rounded-xl font-bold text-xs gap-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all border-none shadow-none"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => { setSelectedUser(user); setIsDeleteDialogOpen(true); }}
                          className="h-9 px-4 rounded-xl font-bold text-xs gap-1.5 bg-emergency/10 text-emergency hover:bg-emergency hover:text-white transition-all border-none shadow-none"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-8 border-none shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-xl">
                 <UserPlus className="h-6 w-6 text-primary" />
              </div>
              System User Intake
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
              <Input 
                required
                value={registerData.name}
                onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                placeholder="Enter full legal name"
                className="h-12 rounded-2xl bg-muted/50 border-none px-4 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Identity</Label>
              <Input 
                required
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                placeholder="e.g. user@safemother.com"
                className="h-12 rounded-2xl bg-muted/50 border-none px-4 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Access Password</Label>
              <Input 
                required
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                placeholder="Minimum 8 characters"
                className="h-12 rounded-2xl bg-muted/50 border-none px-4 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">System Authority (Role)</Label>
              <select 
                value={registerData.role}
                onChange={(e) => setRegisterData({...registerData, role: e.target.value})}
                className="w-full h-12 rounded-2xl bg-muted/50 border-none px-4 font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20"
              >
                <option value="patient">Patient (Portal Access)</option>
                <option value="midwife">Midwife (Clinical Access)</option>
                <option value="admin">Administrator (Full Control)</option>
              </select>
            </div>
            
            <div className="pt-4 flex gap-3">
              <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1 h-12 rounded-2xl font-bold"
              >
                Cancel
              </Button>
              <Button 
                  type="submit" 
                  disabled={isRegistering}
                  className="flex-1 h-12 rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/20"
              >
                {isRegistering ? "Authorizing..." : "Create Account"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-8 border-none shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-black tracking-tight">Modify User Credentials</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest">Full Name</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="h-12 rounded-2xl bg-muted/50 border-none px-4 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest">Email Identity</Label>
              <Input 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="h-12 rounded-2xl bg-muted/50 border-none px-4 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest">System Role</Label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full h-12 rounded-2xl bg-muted/50 border-none px-4 font-bold outline-none"
              >
                <option value="admin">Administrator</option>
                <option value="midwife">Midwife</option>
                <option value="patient">Patient</option>
              </select>
            </div>
          </div>
          <DialogFooter className="mt-8 gap-3 sm:justify-start">
            <Button 
                onClick={handleUpdate} 
                disabled={isUpdating}
                className="flex-1 h-12 rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/20"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
            <Button 
                variant="ghost" 
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1 h-12 rounded-2xl font-bold"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl p-8 border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black tracking-tight text-emergency">Revoke User Access?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium pt-2">
              This action will permanently delete <span className="font-bold text-foreground">"{selectedUser?.name}"</span> and all associated clinical records. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="h-12 rounded-2xl font-bold border-none bg-muted hover:bg-muted/80">Keep User</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleDelete}
                className="h-12 rounded-2xl font-bold bg-emergency text-white hover:bg-emergency/90 shadow-lg shadow-emergency/20"
            >
                Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RoleIcon({ role }: { role: string }) {
  switch (role) {
    case 'admin': return <Shield className="h-3 w-3 mr-1" />;
    case 'midwife': return <Stethoscope className="h-3 w-3 mr-1" />;
    default: return <UserIcon className="h-3 w-3 mr-1" />;
  }
}
