import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kgkqbxdxerroqtjvrhmw.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtna3FieGR4ZXJyb3F0anZyaG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NjM2MjUsImV4cCI6MjA4MTUzOTYyNX0.p4S0vOVnZpO2jHZSV8arygYqX5AVuP2ekMDOzSJ41iA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
