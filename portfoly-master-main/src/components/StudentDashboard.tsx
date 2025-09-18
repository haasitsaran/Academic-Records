import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Trophy, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Calendar, 
  Plus,
  Eye,
  Download,
  AlertCircle,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardData } from "@/hooks/useDashboardData";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

export const StudentDashboard = () => {
  const { achievements, stats, isLoading, error, isEmpty } = useDashboardData();
  const { profile } = useAuth();
  
  // Helper function to get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'verified':
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  // Helper function to get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'verified':
      case 'approved':
        return 'bg-success text-success-foreground';
      case 'rejected':
        return 'bg-destructive text-destructive-foreground';
      default:
        return '';
    }
  };

  const statsData = [
    { 
      label: "Total Achievements", 
      value: stats.total_achievements?.toString() || "0", 
      icon: Trophy, 
      color: "success" 
    },
    { 
      label: "Career Score", 
      value: stats.career_score?.toString() || "0", 
      icon: TrendingUp, 
      color: "primary" 
    },
    { 
      label: "Verified Credits", 
      value: stats.verified_credits?.toString() || "0", 
      icon: Award, 
      color: "secondary" 
    },
    { 
      label: "Portfolio Views", 
      value: stats.portfolio_views?.toString() || "0", 
      icon: Eye, 
      color: "warning" 
    }
  ];

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.full_name || 'Student'}
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" />
            {profile?.role ? `${profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} Dashboard` : 'Loading...'}
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Link to="/achievements">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Achievement
            </Button>
          </Link>
          <Link to="/portfolio">
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View Portfolio
            </Button>
          </Link>
        </div>
      </div>

      {/* Empty State */}
      {!isLoading && isEmpty && (
        <Card className="p-8 mb-8 bg-muted/20 border-dashed">
          <div className="flex flex-col items-center text-center gap-3">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Build your dashboard</h2>
            <p className="text-muted-foreground max-w-xl">
              We couldn't find any data for your dashboard yet. Start by adding your first achievement
              or updating your profile to see insights here.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link to="/achievements">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Achievement
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Complete Profile
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6 card-gradient hover:card-elevated transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  )}
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}/10`}>
                  <Icon className={`h-6 w-6 text-${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Achievements */}
        <div className="lg:col-span-2">
          <Card className="p-6 card-gradient">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-card-foreground flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                {isLoading ? (
                  <Skeleton className="h-6 w-48" />
                ) : (
                  `Recent Achievements${achievements.length > 0 ? ` (${achievements.length})` : ''}`
                )}
              </h2>
              <Link to="/achievements">
                <Button variant="outline" size="sm" disabled={isLoading}>
                  View All
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-4 w-full">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : achievements.length > 0 ? (
                achievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className="flex items-center justify-between p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{achievement.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {achievement.type}
                          </Badge>
                          <Badge 
                            variant={getStatusBadgeVariant(achievement.status)}
                            className={getStatusBadgeClass(achievement.status)}
                          >
                            {achievement.status.charAt(0).toUpperCase() + achievement.status.slice(1)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(achievement.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">+{achievement.points || 0}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No achievements yet. Add your first achievement to get started!</p>
                  <Link to="/achievements">
                    <Button variant="link" className="mt-2">
                      Add Achievement
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Career Progress */}
        <div className="space-y-6">
          {/* Career Score */}
          <Card className="p-6 card-gradient">
            <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Career Readiness
            </h3>
            <div className="text-center mb-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-10 w-24 mx-auto mb-2" />
                  <Skeleton className="h-2 w-full mb-2" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {stats.career_score}/100
                  </div>
                  <Progress value={stats.career_score} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {stats.career_score >= 80 ? 'Excellent Progress!' : 
                     stats.career_score >= 50 ? 'Good Progress!' : 
                     'Keep Going!'}
                  </p>
                </>
              )}
            </div>
            <div className="space-y-2 text-sm">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Technical Skills</span>
                    <span className="font-medium">
                      {Math.min(100, Math.floor(stats.verified_credits / 2))}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Certifications</span>
                    <span className="font-medium">
                      {Math.min(100, Math.floor(stats.verified_credits / 3))}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Projects</span>
                    <span className="font-medium">
                      {Math.min(100, Math.floor(stats.verified_credits / 4))}%
                    </span>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 card-gradient">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/achievements" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Achievement
                </Button>
              </Link>
              <Link to="/portfolio" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download Portfolio
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Review
              </Button>
            </div>
          </Card>

          {/* Achievements by Category */}
          <Card className="p-6 card-gradient">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Categories</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Academic</span>
                </div>
                <Badge variant="secondary">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-success" />
                  <span className="text-sm">Extracurricular</span>
                </div>
                <Badge variant="secondary">8</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-sm">Professional</span>
                </div>
                <Badge variant="secondary">4</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};