import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pzimgbwtqtrjccuirxur.supabase.co'
const supabaseAnonKey = 'sb_publishable_6pevLOuSeHCRx_HJ7VYSuQ_PrfJviar'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)