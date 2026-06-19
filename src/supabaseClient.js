import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uxcfczadmzfuyusgauhk.supabase.co'   // 去 Supabase 项目 Settings → API 里复制 Project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Y2ZjemFkbXpmdXl1c2dhdWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTg1MjYsImV4cCI6MjA5NzM5NDUyNn0.lPbRIJfq9d2-HptfYX5ONYo1Yuc7YXa_NcfJo8uk4nY'           // 复制 anon public key

export const supabase = createClient(supabaseUrl, supabaseAnonKey)