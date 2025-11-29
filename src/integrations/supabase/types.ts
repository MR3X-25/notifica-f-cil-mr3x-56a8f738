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
      extrajudicial_notifications: {
        Row: {
          acceptance_hash: string | null
          acceptance_ip: string | null
          accepted: boolean | null
          accepted_at: string | null
          created_at: string
          creator_hash: string | null
          creator_ip: string | null
          creditor_address: string
          creditor_city: string
          creditor_complement: string | null
          creditor_document: string
          creditor_email: string | null
          creditor_name: string
          creditor_phone: string | null
          creditor_state: string
          creditor_zip: string
          debt_amount: number
          debt_description: string
          debtor_address: string
          debtor_city: string
          debtor_complement: string | null
          debtor_document: string
          debtor_email: string | null
          debtor_name: string
          debtor_phone: string | null
          debtor_state: string
          debtor_zip: string
          due_date: string
          id: string
          payment_deadline_days: number
          pdf_url: string | null
          property_address: string
          status: string
          terms_and_clauses: string
          token: string
          updated_at: string
        }
        Insert: {
          acceptance_hash?: string | null
          acceptance_ip?: string | null
          accepted?: boolean | null
          accepted_at?: string | null
          created_at?: string
          creator_hash?: string | null
          creator_ip?: string | null
          creditor_address: string
          creditor_city: string
          creditor_complement?: string | null
          creditor_document: string
          creditor_email?: string | null
          creditor_name: string
          creditor_phone?: string | null
          creditor_state: string
          creditor_zip: string
          debt_amount: number
          debt_description: string
          debtor_address: string
          debtor_city: string
          debtor_complement?: string | null
          debtor_document: string
          debtor_email?: string | null
          debtor_name: string
          debtor_phone?: string | null
          debtor_state: string
          debtor_zip: string
          due_date: string
          id?: string
          payment_deadline_days?: number
          pdf_url?: string | null
          property_address: string
          status?: string
          terms_and_clauses: string
          token: string
          updated_at?: string
        }
        Update: {
          acceptance_hash?: string | null
          acceptance_ip?: string | null
          accepted?: boolean | null
          accepted_at?: string | null
          created_at?: string
          creator_hash?: string | null
          creator_ip?: string | null
          creditor_address?: string
          creditor_city?: string
          creditor_complement?: string | null
          creditor_document?: string
          creditor_email?: string | null
          creditor_name?: string
          creditor_phone?: string | null
          creditor_state?: string
          creditor_zip?: string
          debt_amount?: number
          debt_description?: string
          debtor_address?: string
          debtor_city?: string
          debtor_complement?: string | null
          debtor_document?: string
          debtor_email?: string | null
          debtor_name?: string
          debtor_phone?: string | null
          debtor_state?: string
          debtor_zip?: string
          due_date?: string
          id?: string
          payment_deadline_days?: number
          pdf_url?: string | null
          property_address?: string
          status?: string
          terms_and_clauses?: string
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
