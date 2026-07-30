import { createClient } from '@supabase/supabase-js'

// Publishable key — safe to ship in client code.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://amtcwuymjjzrsevvouwi.supabase.co'
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_h1i_FwsBy03Vh-V0LAKDTw_QD0v7PMH'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const LOCAL_KEY = 'rakhi-wishlist'
const localLoad = () => JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
const localSave = (w) => localStorage.setItem(LOCAL_KEY, JSON.stringify(w))

// Every call falls back to localStorage so the site still works
// before the table exists or when someone is offline.
export async function fetchWishes() {
  try {
    const { data, error } = await supabase
      .from('wishes')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) throw error
    return { wishes: data, shared: true }
  } catch {
    return { wishes: localLoad(), shared: false }
  }
}

export async function addWish({ name, flowers, title, url }) {
  try {
    const { data, error } = await supabase
      .from('wishes')
      .insert({ name, flowers, title, url })
      .select()
      .single()
    if (error) throw error
    return data
  } catch {
    const w = localLoad()
    const row = { id: Date.now(), name, flowers, title, url }
    w.push(row)
    localSave(w)
    return row
  }
}

export async function removeWish(id) {
  try {
    const { error } = await supabase.from('wishes').delete().eq('id', id)
    if (error) throw error
  } catch {
    localSave(localLoad().filter((w) => w.id !== id))
  }
}

// Live updates: when any sister ties a wish, every open phone sees it bloom.
export function subscribeWishes(onChange) {
  const channel = supabase
    .channel('wishes-live')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'wishes' },
      onChange
    )
    .subscribe()
  return () => supabase.removeChannel(channel)
}
