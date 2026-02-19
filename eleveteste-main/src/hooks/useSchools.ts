import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface School {
  id: string;
  name: string;
  city: string;
  state: string;
}

export const useSchools = () => {
  return useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as School[];
    },
  });
};
