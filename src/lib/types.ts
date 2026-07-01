export type Board = "cases" | "notice" | "resources";

export type PostStatus = "draft" | "published";

export type ProfileRole = "pending" | "admin";

export const caseCategories = ["완전 철거", "인테리어 철거", "석면 해체", "구조물 해체", "비계공사", "토공사", "기타"] as const;

export type CaseCategory = (typeof caseCategories)[number];

export type DemolitionType =
  | "complete"
  | "interior"
  | "asbestos"
  | "structure"
  | "support_fund"
  | "scaffold"
  | "earthwork"
  | "other";

export type QuoteEmailStatus = "pending" | "sent" | "failed";

export type Profile = {
  id: string;
  email: string | null;
  role: ProfileRole;
  created_at: string | null;
  updated_at: string | null;
};

export type Post = {
  id: string;
  board: Board;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  case_category: CaseCategory | null;
  case_location: string | null;
  case_area: string | null;
  case_cost: string | null;
  video_url: string | null;
  status: PostStatus;
  published_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PostImage = {
  id: string;
  post_id: string;
  bucket: "case-images";
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type PostWithImages = Post & {
  images: PostImage[];
};

export type QuoteRequest = {
  id: string;
  demolition_types: DemolitionType[];
  region: string | null;
  address: string | null;
  area: string | null;
  site_memo: string | null;
  contact_name: string | null;
  phone: string;
  privacy_agreed: boolean;
  attachment_bucket: string | null;
  attachment_path: string | null;
  attachment_name: string | null;
  attachment_mime_type: string | null;
  attachment_size_bytes: number | null;
  email_status: QuoteEmailStatus;
  email_error: string | null;
  created_at: string;
};

export type PopupVideoSetting = {
  id: "home";
  youtube_url: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email?: string | null;
          role?: ProfileRole;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          email?: string | null;
          role?: ProfileRole;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: Post;
        Insert: {
          id?: string;
          board: Board;
          title: string;
          slug: string;
          excerpt?: string | null;
          content: string;
          case_category?: CaseCategory | null;
          case_location?: string | null;
          case_area?: string | null;
          case_cost?: string | null;
          video_url?: string | null;
          status?: PostStatus;
          published_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          board?: Board;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: string;
          case_category?: CaseCategory | null;
          case_location?: string | null;
          case_area?: string | null;
          case_cost?: string | null;
          video_url?: string | null;
          status?: PostStatus;
          published_at?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      post_images: {
        Row: PostImage;
        Insert: {
          id?: string;
          post_id: string;
          bucket?: "case-images";
          storage_path: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          post_id?: string;
          bucket?: "case-images";
          storage_path?: string;
          alt_text?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_images_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      quote_requests: {
        Row: QuoteRequest;
        Insert: {
          id?: string;
          demolition_types: DemolitionType[];
          region?: string | null;
          address?: string | null;
          area?: string | null;
          site_memo?: string | null;
          contact_name?: string | null;
          phone: string;
          privacy_agreed: boolean;
          attachment_bucket?: string | null;
          attachment_path?: string | null;
          attachment_name?: string | null;
          attachment_mime_type?: string | null;
          attachment_size_bytes?: number | null;
          email_status?: QuoteEmailStatus;
          email_error?: string | null;
          created_at?: string;
        };
        Update: {
          demolition_types?: DemolitionType[];
          region?: string | null;
          address?: string | null;
          area?: string | null;
          site_memo?: string | null;
          contact_name?: string | null;
          phone?: string;
          privacy_agreed?: boolean;
          attachment_bucket?: string | null;
          attachment_path?: string | null;
          attachment_name?: string | null;
          attachment_mime_type?: string | null;
          attachment_size_bytes?: number | null;
          email_status?: QuoteEmailStatus;
          email_error?: string | null;
        };
        Relationships: [];
      };
      popup_video_settings: {
        Row: PopupVideoSetting;
        Insert: {
          id?: "home";
          youtube_url: string;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          youtube_url?: string;
          enabled?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
