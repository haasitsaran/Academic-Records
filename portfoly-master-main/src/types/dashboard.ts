export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  type: string;
  status: 'pending' | 'verified' | 'rejected' | 'approved';
  points: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_achievements: number;
  career_score: number;
  verified_credits: number;
  portfolio_views: number;
}

export interface DashboardData {
  achievements: Achievement[];
  stats: DashboardStats;
  isLoading: boolean;
  error: Error | null;
}
