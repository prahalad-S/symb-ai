import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useData() {
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [gRes, cRes, rRes] = await Promise.all([
        supabase.from('sidebar_groups').select('*').order('sort_order', { ascending: true }),
        supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('resources').select('*').order('sort_order', { ascending: true })
      ]);
      
      if (gRes.error) throw gRes.error;
      if (cRes.error) throw cRes.error;
      if (rRes.error) throw rRes.error;
      
      setGroups(gRes.data || []);
      setCategories(cRes.data || []);
      setResources(rRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getEmailFromToken = (session) => {
    try {
      const token = session?.access_token || session?.refresh_token;
      if (!token) return null;
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded?.email || decoded?.user?.email || null;
    } catch (e) {
      console.error('Failed to decode JWT', e);
      return null;
    }
  };

  const adminEmails = ['aliaswave7@gmail.com', 'dream3productions@gmail.com'];
  const email = session?.user?.email || getEmailFromToken(session);
  const isAdmin = email && adminEmails.includes(email);


  return { groups, categories, resources, loading, session, isAdmin, refetch: fetchData };
}
