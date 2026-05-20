// Auto-mantener sincronizado con supabase/migrations/0001_initial_schema.sql
// Forma canónica compatible con @supabase/supabase-js (espejo de `supabase gen types`).

export type ExperienceLevel = 'new' | 'base' | 'advanced'
export type GoalType = 'calle' | 'calle_trail' | 'trail'
export type PerceivedBase = 'low' | 'medium' | 'solid'
export type EffortMode = 'hr' | 'rpe' | 'talk_test'
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          age: number | null
          gender: Gender | null
          country: string | null
          experience_level: ExperienceLevel | null
          goal_type: GoalType | null
          weekly_days: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          age?: number | null
          gender?: Gender | null
          country?: string | null
          experience_level?: ExperienceLevel | null
          goal_type?: GoalType | null
          weekly_days?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          age?: number | null
          gender?: Gender | null
          country?: string | null
          experience_level?: ExperienceLevel | null
          goal_type?: GoalType | null
          weekly_days?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profile_metrics: {
        Row: {
          user_id: string
          perceived_base: PerceivedBase | null
          injury_history: boolean
          preferred_effort_mode: EffortMode | null
          zone2_hr_min: number | null
          zone2_hr_max: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          perceived_base?: PerceivedBase | null
          injury_history?: boolean
          preferred_effort_mode?: EffortMode | null
          zone2_hr_min?: number | null
          zone2_hr_max?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          perceived_base?: PerceivedBase | null
          injury_history?: boolean
          preferred_effort_mode?: EffortMode | null
          zone2_hr_min?: number | null
          zone2_hr_max?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: {
      experience_level: ExperienceLevel
      goal_type: GoalType
      perceived_base: PerceivedBase
      effort_mode: EffortMode
      gender: Gender
    }
    CompositeTypes: { [_ in never]: never }
  }
}

// Conveniencia: tipos de fila para usar en componentes ----------------------

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileMetrics =
  Database['public']['Tables']['user_profile_metrics']['Row']
