import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter,
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  User,
  Calendar,
  Eye,
  MessageSquare,
  TrendingUp,
  Award
} from "lucide-react";

export const FacultyPanel = () => {
  const { toast } = useToast();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const pendingSubmissions = [
    {
      id: 1,
      studentName: "John Doe",
      studentId: "CS2021001",
      title: "Google Data Analytics Certificate",
      type: "Certification",
      category: "Professional",
      submittedDate: "2024-01-15",
      documents: ["certificate.pdf", "transcript.pdf"],
      description: "Completed comprehensive data analytics program with practical projects and case studies.",
      priority: "High"
    },
    {
      id: 2,
      studentName: "Jane Smith", 
      studentId: "CS2021002",
      title: "National Hackathon Winner",
      type: "Competition",
      category: "Extracurricular",
      submittedDate: "2024-01-14",
      documents: ["certificate.pdf", "project_details.pdf", "team_photo.jpg"],
      description: "Led team to victory in AI/ML track of National Student Hackathon 2024.",
      priority: "High"
    },
    {
      id: 3,
      studentName: "Mike Johnson",
      studentId: "CS2021003", 
      title: "AWS Cloud Practitioner",
      type: "Certification",
      category: "Technical",
      submittedDate: "2024-01-13",
      documents: ["aws_certificate.pdf"],
      description: "Demonstrated foundational knowledge of AWS cloud services and best practices.",
      priority: "Medium"
    }
  ];

  const recentlyReviewed = [
    {
      id: 4,
      studentName: "Sarah Wilson",
      title: "React Developer Course",
      type: "Course",
      status: "Approved",
      reviewDate: "2024-01-12",
      reviewer: "Dr. Smith"
    },
    {
      id: 5,
      studentName: "David Brown",
      title: "Machine Learning Research",
      type: "Project",
      status: "Rejected",
      reviewDate: "2024-01-11",
      reviewer: "Prof. Johnson"
    }
  ];

  const handleApprove = (submissionId: number) => {
    toast({
      title: "Achievement Approved",
      description: "The submission has been approved and added to student's portfolio.",
    });
  };

  const handleReject = (submissionId: number) => {
    toast({
      title: "Achievement Rejected",
      description: "The submission has been rejected with feedback sent to student.",
      variant: "destructive"
    });
  };

  return (
    <div className="container mx-auto px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Faculty Review Panel</h1>
          <p className="text-muted-foreground">Review and validate student achievement submissions</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button variant="outline" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 card-gradient">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pending Reviews</p>
              <p className="text-2xl font-bold text-foreground">12</p>
            </div>
            <Clock className="h-8 w-8 text-warning" />
          </div>
        </Card>
        <Card className="p-6 card-gradient">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Approved Today</p>
              <p className="text-2xl font-bold text-foreground">8</p>
            </div>
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
        </Card>
        <Card className="p-6 card-gradient">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Reviewed</p>
              <p className="text-2xl font-bold text-foreground">156</p>
            </div>
            <Award className="h-8 w-8 text-primary" />
          </div>
        </Card>
        <Card className="p-6 card-gradient">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Approval Rate</p>
              <p className="text-2xl font-bold text-foreground">87%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-secondary" />
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="reviewed">Recently Reviewed</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Pending Reviews Tab */}
        <TabsContent value="pending" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search submissions..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Submissions List */}
          <div className="grid lg:grid-cols-2 gap-6">
            {pendingSubmissions.map((submission) => (
              <Card key={submission.id} className="p-6 card-gradient hover:card-elevated transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">{submission.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {submission.studentName} ({submission.studentId})
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={submission.priority === "High" ? "destructive" : "secondary"}
                  >
                    {submission.priority}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{submission.type}</Badge>
                    <Badge variant="outline">{submission.category}</Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {submission.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Submitted {submission.submittedDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {submission.documents.length} documents
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex items-center gap-2 flex-1"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <Eye className="h-4 w-4" />
                    Review
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-success hover:bg-success/90 text-success-foreground"
                    onClick={() => handleApprove(submission.id)}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleReject(submission.id)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recently Reviewed Tab */}
        <TabsContent value="reviewed">
          <Card className="p-6 card-gradient">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Recently Reviewed</h3>
            <div className="space-y-4">
              {recentlyReviewed.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.studentName} • Reviewed by {item.reviewer}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={item.status === "Approved" ? "default" : "destructive"}
                      className={item.status === "Approved" ? "bg-success text-success-foreground" : ""}
                    >
                      {item.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{item.reviewDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 card-gradient">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Review Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Submissions</span>
                  <span className="font-semibold">284</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approved</span>
                  <span className="font-semibold text-success">246</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rejected</span>
                  <span className="font-semibold text-destructive">26</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-semibold text-warning">12</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 card-gradient">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Category Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Technical</span>
                  <span className="font-semibold">112</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Academic</span>
                  <span className="font-semibold">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Professional</span>
                  <span className="font-semibold">54</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Extracurricular</span>
                  <span className="font-semibold">29</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Review Modal/Detail View */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 card-gradient">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-card-foreground">Review Submission</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedSubmission(null)}
              >
                Close
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-card-foreground mb-2">{selectedSubmission.title}</h3>
                <p className="text-muted-foreground">{selectedSubmission.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Student</Label>
                  <p className="text-sm">{selectedSubmission.studentName} ({selectedSubmission.studentId})</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Submitted</Label>
                  <p className="text-sm">{selectedSubmission.submittedDate}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Review Comments</Label>
                <Textarea 
                  placeholder="Add your review comments here..."
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  className="bg-success hover:bg-success/90 text-success-foreground flex-1"
                  onClick={() => {
                    handleApprove(selectedSubmission.id);
                    setSelectedSubmission(null);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => {
                    handleReject(selectedSubmission.id);
                    setSelectedSubmission(null);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};