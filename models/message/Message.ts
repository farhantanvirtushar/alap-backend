export interface Message {
  message_id?: string;
  sender_id: number;
  receiver_id: number;
  text?: string;
  image_url?: string;
  video_url?: string;
  created_at?: string;
  updated_at?: string;
}
