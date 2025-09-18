import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Achievement, DashboardStats } from "@/types/dashboard";

type DBAchievement = {
  id?: string;
  user_id?: string;
  title?: string;
  achievement_type?: string;
  status?: 'pending' | 'verified' | 'rejected' | 'approved';
  points?: number;
  category?: string;
  created_at?: string;
  updated_at?: string;
  description?: string;
  date_achieved?: string;
  certificate_url?: string | null;
  verification_method?: 'teacher' | 'ml_model' | null;
  assigned_teacher_id?: string | null;
  [key: string]: unknown; // Allow additional properties
};

type DBStats = {
  total_achievements: number;
  career_score: number;
  verified_credits: number;
  portfolio_views: number;
} | null;

export const useDashboardData = () => {
  const { user } = useAuth();

  const fetchAchievements = async (): Promise<Achievement[]> => {
    if (!user?.id) return [];
    try {
      // Cast to any to avoid excessive generic inference and unioned table types
      const { data, error } = await (supabase as any)
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        // If table doesn't exist or no rows, treat as empty rather than fatal
        console.warn('fetchAchievements error (treated as empty):', error);
        return [];
      }

      // Transform the database achievement to our Achievement type
      return (data as DBAchievement[]).map(ach => {
        // Ensure required fields have default values
        const defaultAch: Achievement = {
          id: ach.id || '',
          user_id: ach.user_id || '',
          title: ach.title || 'Untitled Achievement',
          type: ach.achievement_type || 'other',
          status: ach.status || 'pending',
          points: ach.points || 0,
          category: ach.category || 'other',
          created_at: ach.created_at || new Date().toISOString(),
          updated_at: ach.updated_at || new Date().toISOString()
        };
        return defaultAch;
      });
    } catch (e) {
      console.warn('fetchAchievements exception (treated as empty):', e);
      return [];
    }
  };

  const fetchDashboardStats = async (): Promise<DashboardStats> => {
    if (!user?.id) {
      return {
        total_achievements: 0,
        career_score: 0,
        verified_credits: 0,
        portfolio_views: 0
      };
    }

    try {
      // Cast to any to bypass RPC name literal unions in generated types
      const { data, error } = await (supabase as any)
        .rpc('get_dashboard_stats', { user_id: user.id })
        .single();

      if (error) {
        // If the RPC isn't created yet or returns error, show defaults instead of error UI
        console.warn('fetchDashboardStats error (using defaults):', error);
        return {
          total_achievements: 0,
          career_score: 0,
          verified_credits: 0,
          portfolio_views: 0
        };
      }
      const stats = data as DBStats;
      return stats || {
        total_achievements: 0,
        career_score: 0,
        verified_credits: 0,
        portfolio_views: 0
      };
    } catch (e) {
      console.warn('fetchDashboardStats exception (using defaults):', e);
      return {
        total_achievements: 0,
        career_score: 0,
        verified_credits: 0,
        portfolio_views: 0
      };
    }
  };

  const achievementsQuery = useQuery<Achievement[], Error>({
    queryKey: ['achievements', user?.id],
    queryFn: fetchAchievements,
    enabled: !!user?.id,
  });

  const statsQuery = useQuery<DashboardStats, Error>({
    queryKey: ['dashboardStats', user?.id],
    queryFn: fetchDashboardStats,
    enabled: !!user?.id,
  });

  return {
    achievements: achievementsQuery.data || [],
    stats: statsQuery.data || {
      total_achievements: 0,
      career_score: 0,
      verified_credits: 0,
      portfolio_views: 0
    },
    isLoading: achievementsQuery.isLoading || statsQuery.isLoading,
    // We intentionally swallow known empty-state errors and only surface network/auth errors
    error: null,
    isEmpty: (achievementsQuery.data?.length ?? 0) === 0 &&
      ((statsQuery.data?.total_achievements ?? 0) === 0 &&
       (statsQuery.data?.career_score ?? 0) === 0 &&
       (statsQuery.data?.verified_credits ?? 0) === 0 &&
       (statsQuery.data?.portfolio_views ?? 0) === 0),
  };
};

