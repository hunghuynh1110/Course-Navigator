import { createClient } from "@supabase/supabase-js";

// Thay bằng thông tin thật của bạn
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "YOUR_URL";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR_KEY";

export const supabase = createClient(supabaseUrl, supabaseKey);
