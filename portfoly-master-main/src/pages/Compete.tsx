import { useMemo, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, ExternalLink, Trophy, Briefcase, Presentation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type EventType = "competition" | "workshop" | "placement";

type Listing = {
  id: string;
  title: string;
  org: string;
  date: string; // ISO
  location: string;
  type: EventType;
  tags: string[];
  points: number; // suggested points
  link?: string;
};

const DUMMY_LIST: Listing[] = [
  { id: "c1", title: "National Hackathon 2025", org: "TechGuild", date: "2025-10-22", location: "Onsite - Mumbai", type: "competition", tags: ["Hackathon", "Team"], points: 120, link: "https://example.com/hackathon" },
  { id: "w1", title: "AI/ML Fundamentals", org: "DeepLearn Labs", date: "2025-10-05", location: "Online", type: "workshop", tags: ["AI", "ML"], points: 40, link: "https://example.com/aiml" },
  { id: "p1", title: "Acme Campus Placement Drive", org: "Acme Corp", date: "2025-11-10", location: "Onsite - Campus", type: "placement", tags: ["Software", "SDE"], points: 0, link: "https://example.com/acme" },
  { id: "c2", title: "CodeGolf Sprint", org: "ByteClub", date: "2025-09-30", location: "Online", type: "competition", tags: ["Algorithms"], points: 60 },
  { id: "w2", title: "Cloud Native 101", org: "Clouders", date: "2025-10-15", location: "Hybrid - Pune", type: "workshop", tags: ["Kubernetes", "DevOps"], points: 45 },
  { id: "p2", title: "FinEdge Placement Talk", org: "FinEdge", date: "2025-10-01", location: "Online", type: "placement", tags: ["FinTech", "Intern"], points: 0 },
];

const TypeIcon = ({ type }: { type: EventType }) => {
  if (type === "competition") return <Trophy className="h-4 w-4 text-primary" />;
  if (type === "workshop") return <Presentation className="h-4 w-4 text-success" />;
  return <Briefcase className="h-4 w-4 text-warning" />;
};

const Compete = () => {
  const [tab, setTab] = useState<EventType | "all">("all");
  const { toast } = useToast();
  const [enrolled, setEnrolled] = useState<Record<string, boolean>>({});

  const data = useMemo(() => {
    const sorted = [...DUMMY_LIST].sort((a, b) => +new Date(a.date) - +new Date(b.date));
    return tab === "all" ? sorted : sorted.filter(i => i.type === tab);
  }, [tab]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Compete & Grow</h1>
          <p className="text-muted-foreground">Discover competitions, workshops, and placement drives</p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="space-y-6">
          <TabsList className="w-full grid grid-cols-4 md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="competition">Competitions</TabsTrigger>
            <TabsTrigger value="workshop">Workshops</TabsTrigger>
            <TabsTrigger value="placement">Placement</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="space-y-4">
            {data.map(item => (
              <Card key={item.id} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <TypeIcon type={item.type} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                      <Badge variant="secondary">{item.org}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(item.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{item.location}</span>
                      {item.points > 0 && (
                        <span className="font-medium text-primary">Suggested: +{item.points} pts</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.tags.map(t => (
                        <Badge key={t} variant="outline">{t}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={enrolled[item.id] ? "secondary" : "default"}
                    onClick={() => {
                      setEnrolled(prev => ({ ...prev, [item.id]: true }));
                      toast({
                        title: item.type === "placement" ? "Enrolled" : "Participation Confirmed",
                        description: `${item.title} • ${new Date(item.date).toLocaleDateString()}`,
                      });
                    }}
                    disabled={!!enrolled[item.id]}
                  >
                    {item.type === "placement" ? (enrolled[item.id] ? "Enrolled" : "Enroll") : (enrolled[item.id] ? "Participating" : "Participate")}
                  </Button>
                  <Button variant="outline">Save</Button>
                  <Button asChild>
                    <a href={item.link || "#"} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />View
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Compete;


