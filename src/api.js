import { supabase } from './supabase';

// ─── User creation ──────────────────────────────────────────────────────────
// Uses signUp + session restoration so the admin stays logged in.
// If Supabase has email confirmation OFF, signUp signs in as new user momentarily.
// If email confirmation is ON, signUp doesn't change the current session.
export async function createUserInSupabase({ email, password, name, role, restaurantId }) {
  const { data: { session: adminSession } } = await supabase.auth.getSession();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });

  if (signUpError || !signUpData?.user) {
    return { error: signUpError?.message || 'Error al crear usuario' };
  }

  const newUserId = signUpData.user.id;

  const { error: profileError } = await supabase.from('profiles').insert({
    id: newUserId,
    email,
    name,
    role,
    restaurant_id: restaurantId || null,
    status: 'active',
  });

  // Restore admin session if signUp signed us in as the new user
  if (signUpData.session && adminSession) {
    await supabase.auth.signOut({ scope: 'local' });
    await supabase.auth.setSession({
      access_token: adminSession.access_token,
      refresh_token: adminSession.refresh_token,
    });
  }

  if (profileError) return { error: profileError.message };

  return { data: { id: newUserId, email, name, role } };
}

// ─── Users ──────────────────────────────────────────────────────────────────
export async function fetchUsers({ restaurantId } = {}) {
  let q = supabase
    .from('profiles')
    .select('id, name, email, role, status, restaurant_id, created_at, restaurants(id, name, accent)');
  if (restaurantId) q = q.eq('restaurant_id', restaurantId);
  const { data, error } = await q.order('created_at', { ascending: false });
  return { data, error };
}

export async function updateUserProfile(userId, updates) {
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
  return { error };
}

// ─── Restaurants ────────────────────────────────────────────────────────────
export async function fetchRestaurants() {
  const { data, error } = await supabase.from('restaurants').select('*').order('name');
  return { data, error };
}

export async function saveRestaurant(restaurantData) {
  if (restaurantData.id) {
    const { id, ...updates } = restaurantData;
    const { data, error } = await supabase.from('restaurants').update(updates).eq('id', id).select().single();
    return { data, error };
  }
  const { data, error } = await supabase.from('restaurants').insert(restaurantData).select().single();
  return { data, error };
}
