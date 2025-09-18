export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      academic_results: {
        Row: {
          academic_year: string
          created_at: string
          credits: number
          grade: string
          grade_points: number
          id: string
          marks_obtained: number | null
          semester: number
          student_id: string
          subject_code: string
          subject_name: string
          total_marks: number | null
        }
        Insert: {
          academic_year: string
          created_at?: string
          credits: number
          grade: string
          grade_points: number
          id?: string
          marks_obtained?: number | null
          semester: number
          student_id: string
          subject_code: string
          subject_name: string
          total_marks?: number | null
        }
        Update: {
          academic_year?: string
          created_at?: string
          credits?: number
          grade?: string
          grade_points?: number
          id?: string
          marks_obtained?: number | null
          semester?: number
          student_id?: string
          subject_code?: string
          subject_name?: string
          total_marks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["user_id"]
          },
        ]
      }
      achievements: {
        Row: {
          achievement_type: string
          assigned_teacher_id: string | null
          category: string
          certificate_url: string | null
          created_at: string
          date_achieved: string
          description: string | null
          id: string
          points: number | null
          review_comments: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["submission_status"]
          student_id: string
          title: string
          updated_at: string
          verification_method: Database["public"]["Enums"]["verification_method"]
        }
        Insert: {
          achievement_type: string
          assigned_teacher_id?: string | null
          category: string
          certificate_url?: string | null
          created_at?: string
          date_achieved: string
          description?: string | null
          id?: string
          points?: number | null
          review_comments?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          student_id: string
          title: string
          updated_at?: string
          verification_method?: Database["public"]["Enums"]["verification_method"]
        }
        Update: {
          achievement_type?: string
          assigned_teacher_id?: string | null
          category?: string
          certificate_url?: string | null
          created_at?: string
          date_achieved?: string
          description?: string | null
          id?: string
          points?: number | null
          review_comments?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          student_id?: string
          title?: string
          updated_at?: string
          verification_method?: Database["public"]["Enums"]["verification_method"]
        }
        Relationships: [
          {
            foreignKeyName: "achievements_assigned_teacher_id_fkey"
            columns: ["assigned_teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "achievements_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["user_id"]
          },
        ]
      }
      career_preferences: {
        Row: {
          career_goals: string | null
          id: string
          interests: string[] | null
          preferred_industries: string[] | null
          skills: string[] | null
          student_id: string
          updated_at: string
        }
        Insert: {
          career_goals?: string | null
          id?: string
          interests?: string[] | null
          preferred_industries?: string[] | null
          skills?: string[] | null
          student_id: string
          updated_at?: string
        }
        Update: {
          career_goals?: string | null
          id?: string
          interests?: string[] | null
          preferred_industries?: string[] | null
          skills?: string[] | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_preferences_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["user_id"]
          },
        ]
      }
      career_suggestions: {
        Row: {
          created_at: string
          id: string
          match_percentage: number | null
          reasoning: string | null
          required_skills: string[] | null
          student_id: string
          suggested_career: string
          suggested_courses: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          match_percentage?: number | null
          reasoning?: string | null
          required_skills?: string[] | null
          student_id: string
          suggested_career: string
          suggested_courses?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          match_percentage?: number | null
          reasoning?: string | null
          required_skills?: string[] | null
          student_id?: string
          suggested_career?: string
          suggested_courses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "career_suggestions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email: string
          full_name: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_skills: {
        Row: {
          created_at: string | null
          id: string
          is_technical: boolean | null
          proficiency_level: string | null
          skill_name: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_technical?: boolean | null
          proficiency_level?: string | null
          skill_name: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_technical?: boolean | null
          proficiency_level?: string | null
          skill_name?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          admission_year: number | null
          cgpa: number | null
          created_at: string
          current_semester: number | null
          id: string
          roll_number: string | null
          user_id: string
        }
        Insert: {
          admission_year?: number | null
          cgpa?: number | null
          created_at?: string
          current_semester?: number | null
          id?: string
          roll_number?: string | null
          user_id: string
        }
        Update: {
          admission_year?: number | null
          cgpa?: number | null
          created_at?: string
          current_semester?: number | null
          id?: string
          roll_number?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      teachers: {
        Row: {
          created_at: string
          designation: string | null
          employee_id: string | null
          experience_years: number | null
          id: string
          specialization: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          designation?: string | null
          employee_id?: string | null
          experience_years?: number | null
          id?: string
          specialization?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          designation?: string | null
          employee_id?: string | null
          experience_years?: number | null
          id?: string
          specialization?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      submission_status: "pending" | "approved" | "rejected"
      user_role: "student" | "teacher"
      verification_method: "teacher" | "ml_model"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      submission_status: ["pending", "approved", "rejected"],
      user_role: ["student", "teacher"],
      verification_method: ["teacher", "ml_model"],
    },
  },
} as const
