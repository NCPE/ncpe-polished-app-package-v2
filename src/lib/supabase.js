import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hpzdcvpvhxkytzzxvpum.supabase.co'
const supabaseAnonKey ='sb_publishable_hPqx7PIDUF59O13dcfSV9w_Iv-2BspB'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)