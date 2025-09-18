import { useMemo, useState } from "react";
import { RecruiterNav } from "@/components/RecruiterNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, Download, Mail, Calendar, Star } from "lucide-react";
import { colleges, getAveragePoints } from "./recruiterData";
import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const Recruiter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [pointsRange, setPointsRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  // Get all unique skills and departments from all students
  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    colleges.forEach(c => c.students.forEach(s => s.skills.forEach(skill => skills.add(skill))));
    return Array.from(skills).sort();
  }, []);

  const allDepts = useMemo(() => {
    const depts = new Set<string>();
    colleges.forEach(c => c.students.forEach(s => depts.add(s.department)));
    return Array.from(depts).sort();
  }, []);

  // Get all students from all colleges for filtering
  const allStudents = useMemo(() => {
    return colleges.flatMap(c => c.students.map(s => ({ ...s, college: c.name, collegeSlug: c.slug })));
  }, []);

  const filteredStudents = useMemo(() => {
    return allStudents.filter(student => {
      // Search filter
      if (searchTerm && !student.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !student.college.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Skills filter
      if (selectedSkills.length > 0 && !selectedSkills.some(skill => student.skills.includes(skill))) {
        return false;
      }
      
      // Department filter
      if (selectedDepts.length > 0 && !selectedDepts.includes(student.department)) {
        return false;
      }
      
      // Points range filter
      if (student.points < pointsRange[0] || student.points > pointsRange[1]) {
        return false;
      }
      
      return true;
    });
  }, [allStudents, searchTerm, selectedSkills, selectedDepts, pointsRange]);

  const ranked = useMemo(() => {
    return [...colleges]
      .map(c => ({ ...c, avg: getAveragePoints(c) }))
      .sort((a, b) => b.avg - a.avg);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <RecruiterNav />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Recruiter Dashboard</h1>
          <p className="text-muted-foreground">Discover and filter top talent across colleges</p>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students or colleges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Skills</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {allSkills.map(skill => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={skill}
                          checked={selectedSkills.includes(skill)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSkills([...selectedSkills, skill]);
                            } else {
                              setSelectedSkills(selectedSkills.filter(s => s !== skill));
                            }
                          }}
                        />
                        <label htmlFor={skill} className="text-sm">{skill}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Department</label>
                  <div className="space-y-2">
                    {allDepts.map(dept => (
                      <div key={dept} className="flex items-center space-x-2">
                        <Checkbox
                          id={dept}
                          checked={selectedDepts.includes(dept)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedDepts([...selectedDepts, dept]);
                            } else {
                              setSelectedDepts(selectedDepts.filter(d => d !== dept));
                            }
                          }}
                        />
                        <label htmlFor={dept} className="text-sm">{dept}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Points Range: {pointsRange[0]} - {pointsRange[1]}</label>
                  <Slider
                    value={pointsRange}
                    onValueChange={setPointsRange}
                    max={1000}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing {filteredStudents.length} students from {new Set(filteredStudents.map(s => s.college)).size} colleges
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Star className="h-4 w-4 mr-2" />
              Add to Shortlist
            </Button>
          </div>
        </div>

        {/* Student Results */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredStudents.slice(0, 12).map(student => (
            <Card key={student.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{student.name}</h3>
                  <p className="text-sm text-muted-foreground">{student.college} • {student.department}</p>
                </div>
                <Badge variant="secondary">{student.points} pts</Badge>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {student.skills.slice(0, 3).map(skill => (
                  <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                ))}
                {student.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">+{student.skills.length - 3} more</Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Mail className="h-3 w-3 mr-1" />
                  Contact
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  Interview
                </Button>
                <Button size="sm" variant="outline">
                  <Star className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* College Rankings */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">College Rankings</h2>
          <p className="text-muted-foreground">College rankings by average verified achievement points</p>
        </div>

        <Card className="p-4 md:p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>College</TableHead>
                <TableHead>City</TableHead>
                <TableHead className="text-right">Avg Points</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranked.map((c, i) => (
                <TableRow key={c.slug}>
                  <TableCell>
                    <Badge variant="secondary">#{i + 1}</Badge>
                  </TableCell>
                  <TableCell className="font-medium flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    {c.name}
                  </TableCell>
                  <TableCell>{c.city}</TableCell>
                  <TableCell className="text-right font-semibold">{c.avg}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm">
                      <Link to={`/recruiter/college/${c.slug}`}>View Leaderboard</Link>
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

export default Recruiter;