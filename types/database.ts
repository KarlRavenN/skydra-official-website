export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type EventStatus = "draft" | "published" | "live" | "past" | "cancelled";
export type RegistrationStatus = "open" | "closed" | "paused";
export type BattleType = "tournament" | "non_tournament";
export type AttendeeStatus = "pending" | "confirmed" | "checked_in" | "cancelled";
export type PaymentStatus = "free" | "pending_verification" | "approved" | "rejected";
export type AdminRole = "superadmin" | "admin" | "coordinator" | "gatekeeper";

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          poster_url: string | null;
          event_date: string;
          doors_open_time: string | null;
          venue_name: string;
          venue_address: string;
          google_maps_url: string | null;
          ticket_price: number;
          gcash_qr_url: string | null;
          gcash_account_name: string | null;
          gcash_number: string | null;
          capacity: number;
          status: EventStatus;
          registration_status: RegistrationStatus;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          poster_url?: string | null;
          event_date: string;
          doors_open_time?: string | null;
          venue_name: string;
          venue_address: string;
          google_maps_url?: string | null;
          ticket_price?: number;
          gcash_qr_url?: string | null;
          gcash_account_name?: string | null;
          gcash_number?: string | null;
          capacity: number;
          status?: EventStatus;
          registration_status?: RegistrationStatus;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          poster_url?: string | null;
          event_date?: string;
          doors_open_time?: string | null;
          venue_name?: string;
          venue_address?: string;
          google_maps_url?: string | null;
          ticket_price?: number;
          gcash_qr_url?: string | null;
          gcash_account_name?: string | null;
          gcash_number?: string | null;
          capacity?: number;
          status?: EventStatus;
          registration_status?: RegistrationStatus;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      battles: {
        Row: {
          id: string;
          title: string;
          youtube_url: string;
          youtube_video_id: string;
          battle_type: BattleType;
          event_id: string | null;
          battle_date: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          youtube_url: string;
          youtube_video_id: string;
          battle_type?: BattleType;
          event_id?: string | null;
          battle_date?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          youtube_url?: string;
          youtube_video_id?: string;
          battle_type?: BattleType;
          event_id?: string | null;
          battle_date?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      registrations: {
        Row: {
          id: string;
          event_id: string;
          full_name: string;
          email: string;
          facebook_profile: string;
          age: number;
          phone_number: string;
          house_rules_accepted: boolean;
          privacy_accepted: boolean;
          consent_at: string;
          ticket_code: string;
          status: AttendeeStatus;
          payment_status: PaymentStatus;
          payment_reference: string | null;
          payment_screenshot_url: string | null;
          payment_submitted_at: string | null;
          payment_reviewed_at: string | null;
          payment_rejection_reason: string | null;
          checked_in_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          full_name: string;
          email: string;
          facebook_profile: string;
          age: number;
          phone_number: string;
          house_rules_accepted: boolean;
          privacy_accepted: boolean;
          consent_at?: string;
          ticket_code: string;
          status?: AttendeeStatus;
          payment_status?: PaymentStatus;
          payment_reference?: string | null;
          payment_screenshot_url?: string | null;
          payment_submitted_at?: string | null;
          payment_reviewed_at?: string | null;
          payment_rejection_reason?: string | null;
          checked_in_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          full_name?: string;
          email?: string;
          facebook_profile?: string;
          age?: number;
          phone_number?: string;
          house_rules_accepted?: boolean;
          privacy_accepted?: boolean;
          consent_at?: string;
          ticket_code?: string;
          status?: AttendeeStatus;
          payment_status?: PaymentStatus;
          payment_reference?: string | null;
          payment_screenshot_url?: string | null;
          payment_submitted_at?: string | null;
          payment_reviewed_at?: string | null;
          payment_rejection_reason?: string | null;
          checked_in_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_profiles: {
        Row: {
          id: string;
          full_name: string;
          role: AdminRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: AdminRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: AdminRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      league_settings: {
        Row: {
          key: string;
          value: Json;
          description: string | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          description?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          description?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
      media_assets: {
        Row: {
          id: string;
          event_id: string | null;
          bucket_name: string;
          file_path: string;
          file_name: string;
          mime_type: string;
          size_bytes: number;
          caption: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id?: string | null;
          bucket_name?: string;
          file_path: string;
          file_name: string;
          mime_type: string;
          size_bytes: number;
          caption?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string | null;
          bucket_name?: string;
          file_path?: string;
          file_name?: string;
          mime_type?: string;
          size_bytes?: number;
          caption?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_event_registration_count: {
        Args: { event_uuid: string };
        Returns: number;
      };
    };
    Enums: {
      event_status: EventStatus;
      registration_status: RegistrationStatus;
      battle_type: BattleType;
      attendee_status: AttendeeStatus;
      admin_role: AdminRole;
    };
  };
}
