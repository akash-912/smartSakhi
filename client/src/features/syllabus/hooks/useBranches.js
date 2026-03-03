import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export function useBranches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      // Fetch and sort alphabetically
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name');
      
      if (!error && data) {
        setBranches(data);
      }
      setLoading(false);
    };

    fetchBranches();
  }, []);

  return { branches, loading };
}