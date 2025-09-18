import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, BookOpen, TrendingUp, Award } from 'lucide-react';

interface AcademicResult {
  id: string;
  semester: number;
  subject_code: string;
  subject_name: string;
  credits: number;
  grade: string;
  grade_points: number;
  marks_obtained?: number;
  total_marks?: number;
  academic_year: string;
}

export function AcademicResults() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [results, setResults] = useState<AcademicResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newResult, setNewResult] = useState({
    semester: '',
    subject_code: '',
    subject_name: '',
    credits: '',
    grade: '',
    grade_points: '',
    marks_obtained: '',
    total_marks: '',
    academic_year: ''
  });

  useEffect(() => {
    if (user) {
      fetchResults();
    }
  }, [user]);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('academic_results')
        .select('*')
        .eq('student_id', user?.id)
        .order('semester', { ascending: true });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddResult = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('academic_results')
        .insert({
          student_id: user?.id,
          semester: parseInt(newResult.semester),
          subject_code: newResult.subject_code,
          subject_name: newResult.subject_name,
          credits: parseInt(newResult.credits),
          grade: newResult.grade,
          grade_points: parseFloat(newResult.grade_points),
          marks_obtained: newResult.marks_obtained ? parseInt(newResult.marks_obtained) : null,
          total_marks: newResult.total_marks ? parseInt(newResult.total_marks) : null,
          academic_year: newResult.academic_year
        });

      if (error) throw error;

      toast({
        title: "Result Added",
        description: "Academic result has been added successfully."
      });

      setNewResult({
        semester: '',
        subject_code: '',
        subject_name: '',
        credits: '',
        grade: '',
        grade_points: '',
        marks_obtained: '',
        total_marks: '',
        academic_year: ''
      });
      setShowAddDialog(false);
      fetchResults();
    } catch (error) {
      console.error('Error adding result:', error);
      toast({
        title: "Error",
        description: "Failed to add result. Please try again.",
        variant: "destructive"
      });
    }
  };

  const calculateCGPA = () => {
    if (results.length === 0) return 0;
    
    const totalCredits = results.reduce((sum, result) => sum + result.credits, 0);
    const weightedGradePoints = results.reduce((sum, result) => sum + (result.grade_points * result.credits), 0);
    
    return totalCredits > 0 ? (weightedGradePoints / totalCredits).toFixed(2) : 0;
  };

  const calculateSemesterGPA = (semester: number) => {
    const semesterResults = results.filter(r => r.semester === semester);
    if (semesterResults.length === 0) return 0;
    
    const totalCredits = semesterResults.reduce((sum, result) => sum + result.credits, 0);
    const weightedGradePoints = semesterResults.reduce((sum, result) => sum + (result.grade_points * result.credits), 0);
    
    return totalCredits > 0 ? (weightedGradePoints / totalCredits).toFixed(2) : 0;
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': case 'A': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'B+': case 'B': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'C+': case 'C': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
  };

  const semesters = [...new Set(results.map(r => r.semester))].sort((a, b) => a - b);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Academic Results
          </h2>
          <p className="text-muted-foreground">Track your academic performance</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Result
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Academic Result</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddResult} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="semester">Semester</Label>
                  <Input
                    id="semester"
                    type="number"
                    min="1"
                    max="8"
                    value={newResult.semester}
                    onChange={(e) => setNewResult({...newResult, semester: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="academic-year">Academic Year</Label>
                  <Input
                    id="academic-year"
                    placeholder="2023-24"
                    value={newResult.academic_year}
                    onChange={(e) => setNewResult({...newResult, academic_year: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="subject-code">Subject Code</Label>
                <Input
                  id="subject-code"
                  placeholder="CS101"
                  value={newResult.subject_code}
                  onChange={(e) => setNewResult({...newResult, subject_code: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="subject-name">Subject Name</Label>
                <Input
                  id="subject-name"
                  placeholder="Computer Programming"
                  value={newResult.subject_name}
                  onChange={(e) => setNewResult({...newResult, subject_name: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    min="1"
                    value={newResult.credits}
                    onChange={(e) => setNewResult({...newResult, credits: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Select value={newResult.grade} onValueChange={(value) => setNewResult({...newResult, grade: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C+">C+</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                      <SelectItem value="F">F</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="grade-points">Grade Points</Label>
                <Input
                  id="grade-points"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={newResult.grade_points}
                  onChange={(e) => setNewResult({...newResult, grade_points: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="marks-obtained">Marks Obtained</Label>
                  <Input
                    id="marks-obtained"
                    type="number"
                    min="0"
                    value={newResult.marks_obtained}
                    onChange={(e) => setNewResult({...newResult, marks_obtained: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="total-marks">Total Marks</Label>
                  <Input
                    id="total-marks"
                    type="number"
                    min="1"
                    value={newResult.total_marks}
                    onChange={(e) => setNewResult({...newResult, total_marks: e.target.value})}
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full">Add Result</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* CGPA Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Overall CGPA</p>
                <p className="text-2xl font-bold">{calculateCGPA()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-bold">{results.reduce((sum, r) => sum + r.credits, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Subjects Completed</p>
                <p className="text-2xl font-bold">{results.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Semester-wise Results */}
      <div className="space-y-6">
        {semesters.map(semester => (
          <Card key={semester}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Semester {semester}</span>
                <Badge variant="outline">
                  GPA: {calculateSemesterGPA(semester)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Subject Code</th>
                      <th className="text-left p-2">Subject Name</th>
                      <th className="text-center p-2">Credits</th>
                      <th className="text-center p-2">Grade</th>
                      <th className="text-center p-2">Grade Points</th>
                      {results.some(r => r.marks_obtained) && <th className="text-center p-2">Marks</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {results
                      .filter(r => r.semester === semester)
                      .map(result => (
                        <tr key={result.id} className="border-b">
                          <td className="p-2 font-medium">{result.subject_code}</td>
                          <td className="p-2">{result.subject_name}</td>
                          <td className="p-2 text-center">{result.credits}</td>
                          <td className="p-2 text-center">
                            <Badge className={getGradeColor(result.grade)}>
                              {result.grade}
                            </Badge>
                          </td>
                          <td className="p-2 text-center">{result.grade_points}</td>
                          {results.some(r => r.marks_obtained) && (
                            <td className="p-2 text-center">
                              {result.marks_obtained && result.total_marks 
                                ? `${result.marks_obtained}/${result.total_marks}` 
                                : '-'
                              }
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {results.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-4">Start adding your academic results to track your progress</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Result
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}