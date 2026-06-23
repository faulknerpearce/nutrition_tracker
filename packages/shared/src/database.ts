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
          created_at: string
          entry_date: string
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
          created_at?: string
          entry_date?: string
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
          created_at?: string
          entry_date?: string
        }
        Relationships: [
          {
            foreignKeyName: 'food_entries_user_id_fkey'
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
          created_at: string
        }
        Insert: {
          id: string
          display_name: string
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string
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
