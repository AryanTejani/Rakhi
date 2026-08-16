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

// Delete tokens. A wish can only be removed from the phone that tied it —
// the table has no public delete policy, so a stranger with the link cannot
// wipe the thread. See supabase-setup.sql.
const SECRET_KEY = 'rakhi-secrets'
const secrets = () => JSON.parse(localStorage.getItem(SECRET_KEY) || '{}')
const rememberSecret = (id, secret) =>
  localStorage.setItem(SECRET_KEY, JSON.stringify({ ...secrets(), [id]: secret }))

const newSecret = () =>
  crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : String(Math.random()).slice(2) + Date.now()

// Every call falls back to localStorage so the site still works
// before the table exists or when someone is offline.
export async function fetchWishes() {
  try {
    const { data, error } = await supabase
      .from('wishes')
      .select('id, name, flowers, title, url, created_at')
      .order('created_at', { ascending: true })
    if (error) throw error
    return { wishes: data, shared: true }
  } catch {
    return { wishes: localLoad(), shared: false }
  }
}

export async function addWish({ name, flowers, title, url }) {
  const secret = newSecret()
  try {
    const { data, error } = await supabase
      .from('wishes')
      .insert({ name, flowers, title, url, secret })
      .select('id, name, flowers, title, url, created_at')
      .single()
    if (error) throw error
    rememberSecret(data.id, secret)
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
  const secret = secrets()[id]
  try {
    if (!secret) throw new Error('not this phone')
    const { error } = await supabase.rpc('remove_wish', { p_id: id, p_secret: secret })
    if (error) throw error
  } catch {
    localSave(localLoad().filter((w) => w.id !== id))
  }
}

// Can this device remove this wish? Used to hide a ✕ that would do nothing.
export const canRemove = (id) => Boolean(secrets()[id])

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
