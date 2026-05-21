// Auto-mantener sincronizado con supabase/migrations/0001_initial_schema.sql
// Forma canónica compatible con @supabase/supabase-js (espejo de `supabase gen types`).

export type ExperienceLevel = 'new' | 'base' | 'advanced'
export type GoalType = 'calle' | 'calle_trail' | 'trail'
export type PerceivedBase = 'low' | 'medium' | 'solid'
export type EffortMode = 'hr' | 'rpe' | 'talk_test'
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'
export type PlanStatus = 'active' | 'paused' | 'completed' | 'canceled'
export type SessionStatus = 'pending' | 'completed' | 'skipped'
export type BlockCategory = 'carrera' | 'trail' | 'fuerza' | 'movilidad'
export type TalkTestLevel = 'phrases' | 'words' | 'none'
export type BreathingLevel = 'easy' | 'medium' | 'hard'
export type SessionIntent = 'disfrutar' | 'mejorar' | 'trail'
export type LegsFatigueLevel = 'low' | 'medium' | 'high'
export type SubscriptionStatus = 'trialing' | 'active' | 'canceled' | 'expired'
export type SubscriptionPlan = 'monthly' | 'pack_3m'
export type PaymentMethod = 'transfer' | 'card'
export type Currency = 'ARS' | 'USD'

export type SubscriptionRow = {
  id: string
  user_id: string
  status: SubscriptionStatus
  plan: SubscriptionPlan | null
  payment_method: PaymentMethod | null
  currency: Currency | null
  amount: number | null
  trial_started_on: string
  current_period_end: string
  created_at: string
  updated_at: string
}

export type SessionCheckinRow = {
  id: string
  user_session_id: string
  rpe: number
  talk_test: TalkTestLevel
  breathing: BreathingLevel
  intent: SessionIntent
  pain: boolean
  legs_fatigue: LegsFatigueLevel | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type AdaptationLogRow = {
  id: string
  user_plan_id: string
  week_number: number
  rule_triggered: string
  modifier_applied: number | null
  sessions_modified: number
  message_es: string
  created_at: string
}

// Shape de los bloques embebidos en template_sessions.blocks (JSONB)
export type SessionBlock = {
  code: string
  duration_min: number
  note?: string
}

export type WorkoutBlock = {
  id: string
  code: string
  name: string
  category: BlockCategory
  description: string | null
  is_trail_specific: boolean
}

export type PlanTemplate = {
  id: string
  code: string
  name: string
  description: string | null
  goal_type: GoalType
  experience_level: ExperienceLevel
  weekly_days: number
  total_weeks: number
}

export type TemplateSession = {
  id: string
  template_id: string
  week_number: number
  day_index: number
  session_name: string
  blocks: SessionBlock[]
  total_duration_min: number
  is_deload: boolean
}

export type UserPlanRow = {
  id: string
  user_id: string
  template_id: string
  started_on: string
  status: PlanStatus
  created_at: string
  updated_at: string
}

export type UserSessionRow = {
  id: string
  user_plan_id: string
  template_session_id: string
  scheduled_date: string
  status: SessionStatus
  completed_at: string | null
  duration_modifier: number
  adaptation_note: string | null
  created_at: string
  updated_at: string
}

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
      workout_blocks: {
        Row: WorkoutBlock & { created_at: string }
        Insert: Omit<WorkoutBlock, 'id'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<WorkoutBlock> & { created_at?: string }
        Relationships: []
      }
      plan_templates: {
        Row: PlanTemplate & { created_at: string }
        Insert: Omit<PlanTemplate, 'id'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<PlanTemplate> & { created_at?: string }
        Relationships: []
      }
      template_sessions: {
        Row: TemplateSession
        Insert: Omit<TemplateSession, 'id'> & { id?: string }
        Update: Partial<TemplateSession>
        Relationships: []
      }
      user_plans: {
        Row: UserPlanRow
        Insert: Omit<UserPlanRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<UserPlanRow>
        Relationships: []
      }
      user_sessions: {
        Row: UserSessionRow
        Insert: Omit<
          UserSessionRow,
          | 'id'
          | 'created_at'
          | 'updated_at'
          | 'completed_at'
          | 'duration_modifier'
          | 'adaptation_note'
        > & {
          id?: string
          completed_at?: string | null
          duration_modifier?: number
          adaptation_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<UserSessionRow>
        Relationships: []
      }
      session_checkins: {
        Row: SessionCheckinRow
        Insert: Omit<
          SessionCheckinRow,
          'id' | 'created_at' | 'updated_at'
        > & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<SessionCheckinRow>
        Relationships: []
      }
      subscriptions: {
        Row: SubscriptionRow
        Insert: Omit<
          SubscriptionRow,
          'id' | 'created_at' | 'updated_at' | 'trial_started_on'
        > & {
          id?: string
          trial_started_on?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<SubscriptionRow>
        Relationships: []
      }
      adaptation_logs: {
        Row: AdaptationLogRow
        Insert: Omit<AdaptationLogRow, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<AdaptationLogRow>
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
      plan_status: PlanStatus
      session_status: SessionStatus
      talk_test_level: TalkTestLevel
      breathing_level: BreathingLevel
      session_intent: SessionIntent
      subscription_status: SubscriptionStatus
      subscription_plan: SubscriptionPlan
      payment_method: PaymentMethod
      currency: Currency
      legs_fatigue_level: LegsFatigueLevel
    }
    CompositeTypes: { [_ in never]: never }
  }
}

// Conveniencia: tipos de fila para usar en componentes ----------------------

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileMetrics =
  Database['public']['Tables']['user_profile_metrics']['Row']
