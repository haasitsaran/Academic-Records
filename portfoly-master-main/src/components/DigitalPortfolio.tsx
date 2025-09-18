import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { SkillsManager } from "@/components/SkillsManager";
import { 
  Download, 
  Trophy, 
  Award, 
  BookOpen, 
  Star,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Github,
  ExternalLink,
  TrendingUp,
  User
} from "lucide-react";

interface StudentData {
  profile: {
    full_name: string;
    email: string;
    phone?: string;
  };
  student: {
    roll_number?: string;
    cgpa?: number;
    current_semester?: number;
    technical_skills?: string[];
    interests?: string[];
    career_goals?: string;
    bio?: string;
    linkedin_url?: string;
    github_url?: string;
  };
  achievements: Array<{
    id: string;
    title: string;
    description?: string;
    category: string;
    achievement_type: string;
    date_achieved: string;
    status: string;
    points: number;
    skills?: string[];
  }>;
}

export const DigitalPortfolio = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user && profile) {
      fetchStudentData();
    }
  }, [user, profile]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Fetch student profile with additional data
      const { data: studentProfile, error: profileError } = await supabase
        .from('students')
        .select(`
          *,
          profiles!inner(*)
        `)
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;

      // Fetch achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('student_id', user?.id)
        .order('date_achieved', { ascending: false });

      if (achievementsError) throw achievementsError;

      setStudentData({
        profile: studentProfile.profiles,
        student: studentProfile,
        achievements: achievements || []
      });

    } catch (error) {
      console.error('Error fetching student data:', error);
      toast({
        title: "Error Loading Portfolio",
        description: "Failed to load portfolio data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadPortfolio = async () => {
    toast({
      title: "Download Started",
      description: "Your portfolio PDF is being generated..."
    });
    
    // Create a simple HTML content for PDF generation
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Portfolio - ${studentData?.profile.full_name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .achievement { margin-bottom: 15px; padding: 10px; border: 1px solid #ccc; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${studentData?.profile.full_name || 'Student Portfolio'}</h1>
            <p>${studentData?.profile.email}</p>
            ${studentData?.profile.phone ? `<p>${studentData.profile.phone}</p>` : ''}
          </div>
          
          ${studentData?.student.bio ? `
            <div class="section">
              <h2>About</h2>
              <p>${studentData.student.bio}</p>
            </div>
          ` : ''}
          
          ${studentData?.student.career_goals ? `
            <div class="section">
              <h2>Career Goals</h2>
              <p>${studentData.student.career_goals}</p>
            </div>
          ` : ''}
          
          ${studentData?.achievements && studentData.achievements.length > 0 ? `
            <div class="section">
              <h2>Achievements</h2>
              ${studentData.achievements.map(achievement => `
                <div class="achievement">
                  <h3>${achievement.title}</h3>
                  <p><strong>Type:</strong> ${achievement.achievement_type}</p>
                  <p><strong>Category:</strong> ${achievement.category}</p>
                  <p><strong>Date:</strong> ${new Date(achievement.date_achieved).toLocaleDateString()}</p>
                  ${achievement.description ? `<p>${achievement.description}</p>` : ''}
                  ${achievement.skills ? `<p><strong>Skills:</strong> ${achievement.skills.join(', ')}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </body>
      </html>
    `;
    
    // Create and download the HTML file (in a real app, you'd convert to PDF)
    const blob = new Blob([content], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studentData?.profile.full_name?.replace(/\s+/g, '_')}_Portfolio.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8 animate-fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="container mx-auto px-6 py-8 animate-fade-in">
        <div className="text-center">
          <p>No portfolio data available. Please complete your profile setup.</p>
        </div>
      </div>
    );
  }

  const { profile: profileData, student, achievements } = studentData;
  const careerScore = Math.min(85, achievements.length * 5 + (student.technical_skills?.length || 0) * 2);
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="container mx-auto px-6 py-8 animate-fade-in">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Digital Portfolio</h1>
          <p className="text-muted-foreground">Your comprehensive academic and professional profile</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button onClick={downloadPortfolio} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Portfolio
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="p-6 card-gradient text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarFallback className="text-lg">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-card-foreground mb-2">{profileData.full_name}</h2>
            <p className="text-muted-foreground mb-4">
              {student.roll_number ? `Roll No: ${student.roll_number}` : 'Student'}
              {student.current_semester ? ` • Semester ${student.current_semester}` : ''}
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{profileData.email}</span>
              </div>
              {profileData.phone && (
                <div className="flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData.phone}</span>
                </div>
              )}
              {student.cgpa && (
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span>CGPA: {student.cgpa}</span>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-3 mt-4">
              {student.linkedin_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={student.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {student.github_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={student.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </Card>

          {/* Career Score */}
          <Card className="p-6 card-gradient">
            <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Career Readiness Score
            </h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{careerScore}/100</div>
              <Progress value={careerScore} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                {careerScore >= 80 ? 'Industry Ready' : careerScore >= 60 ? 'Developing' : 'Getting Started'}
              </p>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6 card-gradient">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Portfolio Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-warning" />
                  <span className="text-sm">Achievements</span>
                </div>
                <Badge variant="secondary">{achievements.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-success" />
                  <span className="text-sm">Total Points</span>
                </div>
                <Badge variant="secondary">{achievements.reduce((sum, a) => sum + a.points, 0)}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="text-sm">Verified</span>
                </div>
                <Badge variant="secondary">{achievements.filter(a => a.status === 'approved').length}</Badge>
              </div>
            </div>
          </Card>

          {/* Skills Overview */}
          <Card className="p-6 card-gradient">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Technical Skills</h3>
            {student.technical_skills && student.technical_skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {student.technical_skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No technical skills added yet.</p>
            )}
          </Card>

          {/* Interests */}
          {student.interests && student.interests.length > 0 && (
            <Card className="p-6 card-gradient">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {student.interests.map((interest, index) => (
                  <Badge key={index} variant="outline">
                    {interest}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Career Goals */}
          {student.career_goals && (
            <Card className="p-6 card-gradient">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Career Goals</h3>
              <p className="text-muted-foreground">{student.career_goals}</p>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Achievements Section */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              Featured Achievements
            </h2>

            <div className="space-y-6">
              {achievements.length > 0 ? (
                achievements.map((achievement, index) => (
                  <Card key={index} className="p-6 card-gradient hover:card-elevated transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-card-foreground mb-1">
                              {achievement.title}
                            </h3>
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline">{achievement.achievement_type}</Badge>
                              <Badge variant="outline">{achievement.category}</Badge>
                              <Badge className={`${
                                achievement.status === 'approved' 
                                  ? 'bg-success/10 text-success border-success/20' 
                                  : achievement.status === 'pending'
                                  ? 'bg-warning/10 text-warning border-warning/20'
                                  : 'bg-destructive/10 text-destructive border-destructive/20'
                              }`}>
                                {achievement.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(achievement.date_achieved).toLocaleDateString()}
                              </div>
                              {achievement.points > 0 && (
                                <div className="flex items-center gap-1">
                                  <Award className="h-4 w-4" />
                                  {achievement.points} points
                                </div>
                              )}
                            </div>
                            {achievement.description && (
                              <p className="text-muted-foreground mb-3">{achievement.description}</p>
                            )}
                            {achievement.skills && achievement.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {achievement.skills.map((skill, skillIndex) => (
                                  <Badge key={skillIndex} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Achievements Yet</h3>
                  <p className="text-muted-foreground">Start adding your achievements to build your portfolio!</p>
                </Card>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {student.bio && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                About Me
              </h2>
              <Card className="p-6 card-gradient">
                <p className="text-muted-foreground leading-relaxed">{student.bio}</p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};