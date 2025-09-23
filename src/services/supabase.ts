// Supabase client and storage helpers (legacy; prefer config/supabase for client).
import { createClient } from '@supabase/supabase-js';

// These would normally come from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket for profile pictures
export const PROFILE_PICTURES_BUCKET = 'profile-pictures';

// Helper function to upload profile picture
export const uploadProfilePicture = async (file: File, userId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(PROFILE_PICTURES_BUCKET)
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from(PROFILE_PICTURES_BUCKET)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return null;
  }
};

// Helper function to delete profile picture
export const deleteProfilePicture = async (fileName: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(PROFILE_PICTURES_BUCKET)
      .remove([fileName]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return false;
  }
};
