import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { RecruiterNav } from "@/components/RecruiterNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { colleges } from "./recruiterData";

const RecruiterCollege = () => {
  const { slug } = useParams();
  const college = useMemo(() => colleges.find(c => c.slug === slug), [slug]);
  const students = useMemo(() => (college ? [...college.students].sort((a,b)=>b.points-a.points) : []), [college]);

  return (
    <div className="min-h-screen bg-background">
      <RecruiterNav />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{college?.name || 'College'}</h1>
            <p className="text-muted-foreground">Leaderboard by points</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/recruiter">Back</Link>
          </Button>
        </div>

        <Card className="p-4 md:p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s, i) => (
                <TableRow key={s.id}>
                  <TableCell><Badge variant="secondary">#{i+1}</Badge></TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.department}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {s.skills.map(sk => <Badge key={sk} variant="outline">{sk}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{s.points}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm">
                      <Link to={`/recruiter/student/${s.id}`}>View Portfolio</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default RecruiterCollege;


