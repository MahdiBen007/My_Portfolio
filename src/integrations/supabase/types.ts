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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      about: {
        Row: {
          bio: string | null
          bio_ar: string | null
          created_at: string
          id: string
          profile_image_url: string | null
          resume_url: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          bio_ar?: string | null
          created_at?: string
          id?: string
          profile_image_url?: string | null
          resume_url?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          bio_ar?: string | null
          created_at?: string
          id?: string
          profile_image_url?: string | null
          resume_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          email: string
          id: string
          internal_notes: string | null
          is_read: boolean
          is_replied: boolean
          is_spam: boolean
          is_starred: boolean
          message: string
          name: string
          received_at: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          internal_notes?: string | null
          is_read?: boolean
          is_replied?: boolean
          is_spam?: boolean
          is_starred?: boolean
          message: string
          name: string
          received_at?: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          internal_notes?: string | null
          is_read?: boolean
          is_replied?: boolean
          is_spam?: boolean
          is_starred?: boolean
          message?: string
          name?: string
          received_at?: string
          subject?: string | null
        }
        Relationships: []
      }
      page_blocks: {
        Row: {
          animation_preset: string | null
          background_style: string | null
          block_type: string
          created_at: string
          custom_content: string | null
          id: string
          layout_variant: string | null
          padding_bottom: number | null
          padding_top: number | null
          page_id: string
          settings: Json | null
          sort_order: number
          subtitle: string | null
          title: string | null
          updated_at: string
          visible: boolean
        }
        Insert: {
          animation_preset?: string | null
          background_style?: string | null
          block_type: string
          created_at?: string
          custom_content?: string | null
          id?: string
          layout_variant?: string | null
          padding_bottom?: number | null
          padding_top?: number | null
          page_id: string
          settings?: Json | null
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
          visible?: boolean
        }
        Update: {
          animation_preset?: string | null
          background_style?: string | null
          block_type?: string
          created_at?: string
          custom_content?: string | null
          id?: string
          layout_variant?: string | null
          padding_bottom?: number | null
          padding_top?: number | null
          page_id?: string
          settings?: Json | null
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "page_blocks_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_sections: {
        Row: {
          content: string | null
          created_at: string
          id: string
          project_id: string
          section_type: string
          sort_order: number
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          project_id: string
          section_type: string
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          project_id?: string
          section_type?: string
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_sections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          category: string | null
          created_at: string
          description: string
          description_ar: string | null
          featured: boolean
          gallery_images: string[] | null
          github_link: string | null
          id: string
          live_demo_link: string | null
          sort_order: number
          status: Database["public"]["Enums"]["project_status"]
          tech_stack: string[] | null
          thumbnail_url: string | null
          title: string
          title_ar: string | null
          updated_at: string
          visible: boolean
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          description_ar?: string | null
          featured?: boolean
          gallery_images?: string[] | null
          github_link?: string | null
          id?: string
          live_demo_link?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["project_status"]
          tech_stack?: string[] | null
          thumbnail_url?: string | null
          title: string
          title_ar?: string | null
          updated_at?: string
          visible?: boolean
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          description_ar?: string | null
          featured?: boolean
          gallery_images?: string[] | null
          github_link?: string | null
          id?: string
          live_demo_link?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["project_status"]
          tech_stack?: string[] | null
          thumbnail_url?: string | null
          title?: string
          title_ar?: string | null
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          cta_label: string | null
          cta_link: string | null
          description: string
          description_ar: string | null
          icon: string
          id: string
          sort_order: number
          tags: string[] | null
          title: string
          title_ar: string | null
          updated_at: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          cta_link?: string | null
          description: string
          description_ar?: string | null
          icon?: string
          id?: string
          sort_order?: number
          tags?: string[] | null
          title: string
          title_ar?: string | null
          updated_at?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          cta_link?: string | null
          description?: string
          description_ar?: string | null
          icon?: string
          id?: string
          sort_order?: number
          tags?: string[] | null
          title?: string
          title_ar?: string | null
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      settings: {
        Row: {
          animations_enabled: boolean | null
          admin_meta_title: string | null
          background_gradient: string | null
          behance_url: string | null
          border_radius: number | null
          canonical_url: string | null
          copyright_text: string | null
          created_at: string
          custom_links: Json | null
          email: string | null
          footer_contact_info: string | null
          footer_links: Json | null
          github_url: string | null
          id: string
          keywords: string | null
          linkedin_url: string | null
          locale: string | null
          meta_description: string | null
          meta_title: string | null
          og_image_url: string | null
          primary_color: string | null
          secondary_color: string | null
          shadow_intensity: number | null
          site_font: string | null
          spacing_density: string | null
          ui_font: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          animations_enabled?: boolean | null
          admin_meta_title?: string | null
          background_gradient?: string | null
          behance_url?: string | null
          border_radius?: number | null
          canonical_url?: string | null
          copyright_text?: string | null
          created_at?: string
          custom_links?: Json | null
          email?: string | null
          footer_contact_info?: string | null
          footer_links?: Json | null
          github_url?: string | null
          id?: string
          keywords?: string | null
          linkedin_url?: string | null
          locale?: string | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          shadow_intensity?: number | null
          site_font?: string | null
          spacing_density?: string | null
          ui_font?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          animations_enabled?: boolean | null
          admin_meta_title?: string | null
          background_gradient?: string | null
          behance_url?: string | null
          border_radius?: number | null
          canonical_url?: string | null
          copyright_text?: string | null
          created_at?: string
          custom_links?: Json | null
          email?: string | null
          footer_contact_info?: string | null
          footer_links?: Json | null
          github_url?: string | null
          id?: string
          keywords?: string | null
          linkedin_url?: string | null
          locale?: string | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          shadow_intensity?: number | null
          site_font?: string | null
          spacing_density?: string | null
          ui_font?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          brand_color: string | null
          category: Database["public"]["Enums"]["skill_category"]
          created_at: string
          icon: string
          id: string
          level: number
          name: string
          name_ar: string | null
          sort_order: number
          updated_at: string
          visible: boolean
        }
        Insert: {
          brand_color?: string | null
          category?: Database["public"]["Enums"]["skill_category"]
          created_at?: string
          icon?: string
          id?: string
          level?: number
          name: string
          name_ar?: string | null
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Update: {
          brand_color?: string | null
          category?: Database["public"]["Enums"]["skill_category"]
          created_at?: string
          icon?: string
          id?: string
          level?: number
          name?: string
          name_ar?: string | null
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      timeline: {
        Row: {
          created_at: string
          description: string | null
          description_ar: string | null
          icon: string | null
          id: string
          sort_order: number
          title: string
          title_ar: string | null
          updated_at: string
          visible: boolean
          year: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          icon?: string | null
          id?: string
          sort_order?: number
          title: string
          title_ar?: string | null
          updated_at?: string
          visible?: boolean
          year: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          icon?: string | null
          id?: string
          sort_order?: number
          title?: string
          title_ar?: string | null
          updated_at?: string
          visible?: boolean
          year?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_editor: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor"
      project_status: "completed" | "in_progress" | "planned"
      skill_category: "frontend" | "backend" | "database" | "tools" | "other"
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
      app_role: ["admin", "editor"],
      project_status: ["completed", "in_progress", "planned"],
      skill_category: ["frontend", "backend", "database", "tools", "other"],
    },
  },
} as const
