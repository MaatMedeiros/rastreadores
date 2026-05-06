import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ztsxtfvcbsfvjflybwdc.supabase.co'
const supabaseKey = 'sb_publishable_a4CDDhpN1BGKwSW7rBNKeQ_jTF_ddhH'

export const supabase = createClient(supabaseUrl, supabaseKey)