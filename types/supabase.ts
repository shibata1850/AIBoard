export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          role: string
        }
        Insert: {
          id: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: string
        }
        Update: {
          id?: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: string
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      group_members: {
        Row: {
          group_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          group_id: string
          user_id: string
          role: string
          joined_at?: string
        }
        Update: {
          group_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      group_invitations: {
        Row: {
          id: string
          group_id: string
          email: string
          role: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          group_id: string
          email: string
          role: string
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          email?: string
          role?: string
          created_at?: string
          expires_at?: string
        }
      }
      business_documents: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          file_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          file_type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          file_type?: string
          created_at?: string
        }
      }
      document_analyses: {
        Row: {
          id: string
          document_id: string
          analysis_type: string
          content: string
          created_at: string
          summary: string
        }
        Insert: {
          id?: string
          document_id: string
          analysis_type: string
          content: string
          created_at?: string
          summary: string
        }
        Update: {
          id?: string
          document_id?: string
          analysis_type?: string
          content?: string
          created_at?: string
          summary?: string
        }
      }
      my_prompts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          category: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
