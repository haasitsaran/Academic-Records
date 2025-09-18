import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { RecruiterNav } from "@/components/RecruiterNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { colleges } from "./recruiterData";
import { User, Award, BookOpen, Calendar } from "lucide-react";

const RecruiterStudent = () => {
  const { id } = useParams();
  const student = useMemo(() => {
    for (const c of colleges) {
      const s = c.students.find(st => st.id === id);
      if (s) return { s, college: c };
    }
    return undefined;
  }, [id]);

  return (
    <div className="min-h-screen bg-background">
      <RecruiterNav />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Candidate Portfolio</h1>
            <p className="text-muted-foreground">Demo profile for showcase</p>
          </div>
          <Button asChild variant="outline">
            <Link to={`/recruiter/college/${student?.college.slug || ''}`}>Back</Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <Card className="p-6 text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
                <User className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold">{student?.s.name}</h2>
              <p className="text-muted-foreground">{student?.college.name} • {student?.s.department}</p>
              <div className="flex justify-center gap-2 mt-3 flex-wrap">
                {student?.s.skills.map(sk => <Badge key={sk} variant="secondary">{sk}</Badge>)}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2"><Award className="h-4 w-4" /> Summary</h3>
              <p className="text-sm text-muted-foreground">Verified achievement points: <span className="font-semibold">{student?.s.points}</span></p>
              <p className="text-sm text-muted-foreground">Interests: Projects, Hackathons, Research</p>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><BookOpen className="h-4 w-4" /> Featured Achievements (demo)</h3>
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="p-4 rounded-lg bg-muted/20 flex items-center justify-between">
                    <div>
                      <p className="font-medium">Project #{i}: Innovative App</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Calendar className="h-3 w-3" /> 2025</p>
                    </div>
                    <Badge variant="outline">+{Math.max(20, (student?.s.points || 0)/50 | 0)} pts</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterStudent;


