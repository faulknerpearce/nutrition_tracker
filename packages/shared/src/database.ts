import type { NutritionGoals } from './goals.js'

export type Database = {
  public: {
    Tables: {
      food_entries: {
        Row: {
          id: string
          user_id: string
          icon: string
          icon_bg: string
          icon_color: string
          name: string
          description: string
          calories: number
          protein: number
          carbs: number
          caffeine: number
          fat: number
          fiber: number
          created_at: string
          entry_date: string
          recipe_id: string | null
          servings_logged: number | null
        }
        Insert: {
          id?: string
          user_id: string
          icon?: string
          icon_bg?: string
          icon_color?: string
          name: string
          description?: string
          calories: number
          protein: number
          carbs?: number
          caffeine?: number
          fat?: number
          fiber?: number
          created_at?: string
          entry_date?: string
          recipe_id?: string | null
          servings_logged?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          icon?: string
          icon_bg?: string
          icon_color?: string
          name?: string
          description?: string
          calories?: number
          protein?: number
          carbs?: number
          caffeine?: number
          fat?: number
          fiber?: number
          created_at?: string
          entry_date?: string
          recipe_id?: string | null
          servings_logged?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'food_entries_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'food_entries_recipe_id_fkey'
            columns: ['recipe_id']
            isOneToOne: false
            referencedRelation: 'recipes'
            referencedColumns: ['id']
          },
        ]
      }
      recipes: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          icon: string
          icon_bg: string
          icon_color: string
          default_servings: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string
          icon?: string
          icon_bg?: string
          icon_color?: string
          default_servings?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          icon?: string
          icon_bg?: string
          icon_color?: string
          default_servings?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'recipes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          id: string
          recipe_id: string
          user_id: string
          sort_order: number
          name: string
          amount: string
          calories: number
          protein: number
          carbs: number
          fat: number
          fiber: number
          caffeine: number
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          user_id: string
          sort_order?: number
          name: string
          amount?: string
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          fiber?: number
          caffeine?: number
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          user_id?: string
          sort_order?: number
          name?: string
          amount?: string
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          fiber?: number
          caffeine?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'recipe_ingredients_recipe_id_fkey'
            columns: ['recipe_id']
            isOneToOne: false
            referencedRelation: 'recipes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'recipe_ingredients_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      activities: {
        Row: {
          id: string
          user_id: string
          name: string
          activity_type: string
          activity_date: string
          distance_meters: number | null
          moving_time_seconds: number
          average_heartrate: number | null
          max_heartrate: number | null
          calories: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          activity_type: string
          activity_date?: string
          distance_meters?: number | null
          moving_time_seconds: number
          average_heartrate?: number | null
          max_heartrate?: number | null
          calories?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          activity_type?: string
          activity_date?: string
          distance_meters?: number | null
          moving_time_seconds?: number
          average_heartrate?: number | null
          max_heartrate?: number | null
          calories?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'activities_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          display_name: string
          nutrition_goals: NutritionGoals
          age: number | null
          height_cm: number | null
          weight_kg: number | null
          created_at: string
        }
        Insert: {
          id: string
          display_name: string
          nutrition_goals?: NutritionGoals
          age?: number | null
          height_cm?: number | null
          weight_kg?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          nutrition_goals?: NutritionGoals
          age?: number | null
          height_cm?: number | null
          weight_kg?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
