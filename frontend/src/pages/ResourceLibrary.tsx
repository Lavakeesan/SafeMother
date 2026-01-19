import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Plus, Printer, Check, BookOpen
} from "lucide-react";

const resources = [
  {
    category: "Handout",
    categoryColor: "bg-primary",
    badge: "NHS Approved",
    year: "2024",
    title: "Prenatal Nutrition & Supplement Guide",
    description: "Detailed nutritional requirements, caloric intake per trimester, and...",
    image: "nutrition",
  },
  {
    category: "Clinical Protocol",
    categoryColor: "bg-success",
    badge: "WHO Standard",
    year: "Updated 2M Ago",
    title: "Active Labor Monitoring Protocols",
    description: "Step-by-step clinical instructions for monitoring contractions, dilation, and...",
    image: "labor",
  },
  {
    category: "Wellness",
    categoryColor: "bg-primary",
    badge: "Psychology Dept",
    year: "2024",
    title: "Postpartum Mental Wellness Handout",
    description: "Self-screening tools for postpartum depression, local support group...",
    image: "wellness",
  },
  {
    category: "Safety",
    categoryColor: "bg-warning",
    badge: "Pediatric Board",
    year: "2023",
    title: "Safe Sleep Practices for Newborns",
    description: "Evidence-based guidelines for infant sleep positioning...",
    image: "safety",
  },
  {
    category: "Protocol",
    categoryColor: "bg-emergency",
    badge: "Hospital Network",
    year: "Updated 2W Ago",
    title: "Gestational Diabetes Management",
    description: "Comprehensive protocol for monitoring and managing GDM...",
    image: "diabetes",
  },
];

const categories = ["All Resources", "Prenatal", "Labor & Delivery", "Postnatal", "Newborn Care"];

export default function ResourceLibrary() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        variant="midwife" 
        userName="Sarah Jenkins" 
        userRole="Midwife Professional" 
      />

      <div className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full uppercase tracking-wide mb-2">
              Official Guidelines
            </span>
            <h1 className="text-3xl font-bold text-foreground">Medical Advice & Guidance Library</h1>
            <p className="text-muted-foreground mt-1">
              Clinical standards and educational handouts for professional midwifery care.
            </p>
          </div>

          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Request New Resource
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by protocol, symptom, or treatment ke..."
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            {categories.map((cat, i) => (
              <Button
                key={cat}
                variant={i === 0 ? "default" : "outline"}
                size="sm"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, i) => (
            <div key={i} className="bg-card rounded-xl border overflow-hidden hover:shadow-card-hover transition-all">
              {/* Image Placeholder */}
              <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-primary/30" />
                <span className={`absolute top-3 left-3 px-2 py-1 ${resource.categoryColor} text-white text-xs font-medium rounded uppercase`}>
                  {resource.category}
                </span>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {resource.badge} • {resource.year}
                  </span>
                </div>

                <h3 className="font-semibold text-foreground mb-2">{resource.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>

                <div className="flex items-center gap-2">
                  <Button className="flex-1 gap-2">
                    <span>▶</span>
                    Send to Patient
                  </Button>
                  <Button variant="outline" size="icon">
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Resource Placeholder */}
          <div className="bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center min-h-[360px] cursor-pointer hover:border-primary/50 transition-colors">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground">Add New Resource</p>
            </div>
          </div>
        </div>

        {/* Footer Status */}
        <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="font-medium">System Status:</span>
          <span>All protocols updated</span>
        </div>
      </div>
    </div>
  );
}
