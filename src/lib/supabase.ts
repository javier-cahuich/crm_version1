import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vlwkvcuonghchsdaxtws.supabase.co";
const supabaseAnonKey = "sb_publishable_1DogKelst6XmfYmnvfYZSw_tc5mTiHX"; // Key provided by user

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
