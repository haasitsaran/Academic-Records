import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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
  TrendingUp,
  Award,
  Download
} from "lucide-react";

interface Achievement {
  id: string;
  student_id: string;
  title: string;
  description: string;
  achievement_type: string;
  category: string;
  date_achieved: string;
  certificate_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  review_comments: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
  students: {
    roll_number: string;
  } | null;
}

export const FacultyPanelReal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [selectedSubmission, setSelectedSubmission] = useState<Achievement | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) {
      fetchAchievements();
      setupRealtimeSubscription();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select(`
          *,
          profiles:student_id (
            full_name,
            email
          ),
          students:student_id (
            roll_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAchievements((data as any[]) || []);
      
      // Calculate stats
      const pending = data?.filter(a => a.status === 'pending').length || 0;
      const approved = data?.filter(a => a.status === 'approved').length || 0;
      const rejected = data?.filter(a => a.status === 'rejected').length || 0;
      
      setPendingCount(pending);
      setApprovedCount(approved);
      setRejectedCount(rejected);
      
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: "Error",
        description: "Failed to load achievements. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('achievements_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'achievements'
        },
        (payload) => {
          console.log('Real-time achievement change:', payload);
          fetchAchievements(); // Refresh data
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Submission",
              description: `New achievement submitted: ${payload.new.title}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleUpdateStatus = async (achievementId: string, status: 'approved' | 'rejected', comments?: string) => {
    try {
      const { error } = await supabase
        .from('achievements')
        .update({
          status,
          review_comments: comments || null,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', achievementId);

      if (error) throw error;

      toast({
        title: status === 'approved' ? "Achievement Approved" : "Achievement Rejected",
        description: `The submission has been ${status} and student has been notified.`,
        variant: status === 'approved' ? "default" : "destructive"
      });

      fetchAchievements();
      setSelectedSubmission(null);
      setReviewComment("");
    } catch (error) {
      console.error('Error updating achievement:', error);
      toast({
        title: "Error",
        description: "Failed to update achievement status.",
        variant: "destructive"
      });
    }
  };

  const downloadCertificate = async (certificateUrl: string, title: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('certificates')
        .download(certificateUrl);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}_certificate`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download certificate.",
        variant: "destructive"
      });
    }
  };

  const filteredAchievements = achievements.filter(achievement =>
    achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achievement.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achievement.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingAchievements = filteredAchievements.filter(a => a.status === 'pending');
  const reviewedAchievements = filteredAchievements.filter(a => a.status !== 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
            </div>
            <Clock className="h-8 w-8 text-warning" />
          </div>
        </Card>
        <Card className="p-6 card-gradient">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Approved</p>
              <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
        </Card>
        <Card className="p-6 card-gradient">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Rejected</p>
              <p className="text-2xl font-bold text-foreground">{rejectedCount}</p>
            </div>
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
        </Card>
        <Card className="p-6 card-gradient">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total</p>
              <p className="text-2xl font-bold text-foreground">{achievements.length}</p>
            </div>
            <Award className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Review ({pendingCount})</TabsTrigger>
          <TabsTrigger value="reviewed">Recently Reviewed ({reviewedAchievements.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Search Bar */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search submissions..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Pending Reviews Tab */}
        <TabsContent value="pending" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {pendingAchievements.map((achievement) => (
              <Card key={achievement.id} className="p-6 card-gradient hover:card-elevated transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">{achievement.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {achievement.profiles?.full_name} ({achievement.students?.roll_number})
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {achievement.category}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{achievement.achievement_type}</Badge>
                    <Badge variant="outline">{achievement.category}</Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(achievement.created_at).toLocaleDateString()}
                    </div>
                    {achievement.certificate_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadCertificate(achievement.certificate_url, achievement.title)}
                        className="text-xs h-auto p-1"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Certificate
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex items-center gap-2 flex-1"
                    onClick={() => setSelectedSubmission(achievement)}
                  >
                    <Eye className="h-4 w-4" />
                    Review
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-success hover:bg-success/90 text-success-foreground"
                    onClick={() => handleUpdateStatus(achievement.id, 'approved')}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleUpdateStatus(achievement.id, 'rejected')}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {pendingAchievements.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Pending Reviews</h3>
              <p className="text-muted-foreground">All submissions have been reviewed!</p>
            </div>
          )}
        </TabsContent>

        {/* Recently Reviewed Tab */}
        <TabsContent value="reviewed">
          <Card className="p-6 card-gradient">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Recently Reviewed</h3>
            <div className="space-y-4">
              {reviewedAchievements.slice(0, 10).map((achievement) => (
                <div key={achievement.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {achievement.profiles?.full_name} • {achievement.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={achievement.status === "approved" ? "default" : "destructive"}
                      className={achievement.status === "approved" ? "bg-success text-success-foreground" : ""}
                    >
                      {achievement.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(achievement.created_at).toLocaleDateString()}
                    </span>
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
                  <span className="font-semibold">{achievements.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approved</span>
                  <span className="font-semibold text-success">{approvedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rejected</span>
                  <span className="font-semibold text-destructive">{rejectedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-semibold text-warning">{pendingCount}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 card-gradient">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Category Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(
                  achievements.reduce((acc, achievement) => {
                    acc[achievement.category] = (acc[achievement.category] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([category, count]) => (
                  <div key={category} className="flex justify-between">
                    <span className="text-muted-foreground">{category}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
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
                  <p className="text-sm">{selectedSubmission.profiles?.full_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Submitted</Label>
                  <p className="text-sm">{new Date(selectedSubmission.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm">{selectedSubmission.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm">{selectedSubmission.achievement_type}</p>
                </div>
              </div>

              {selectedSubmission.certificate_url && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Certificate</Label>
                  <Button
                    variant="outline"
                    onClick={() => downloadCertificate(selectedSubmission.certificate_url, selectedSubmission.title)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Certificate
                  </Button>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium mb-2 block">Review Comments</Label>
                <Textarea 
                  placeholder="Add your review comments here..."
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  className="bg-success hover:bg-success/90 text-success-foreground flex-1"
                  onClick={() => handleUpdateStatus(selectedSubmission.id, 'approved', reviewComment)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => handleUpdateStatus(selectedSubmission.id, 'rejected', reviewComment)}
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