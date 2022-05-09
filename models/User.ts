export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  phone_no: string;
  profile_photo: string;
  created_at: Date;
  updated_at: Date;
}
