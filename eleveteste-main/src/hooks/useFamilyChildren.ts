import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFamily } from './useFamily';

interface FamilyChild {
  id: string;
  name: string;
  grade: string;
  avatarUrl: string;
}

export const useFamilyChildren = () => {
  const { family, isLoading: isLoadingFamily } = useFamily();

  const childrenQuery = useQuery({
    queryKey: ['family-children', family?.id],
    queryFn: async () => {
      if (!family?.id) return [];

      // Get all student members from this family
      const { data: members, error: membersError } = await supabase
        .from('family_members')
        .select('profile_id')
        .eq('family_id', family.id)
        .eq('member_role', 'student');

      if (membersError) throw membersError;
      if (!members || members.length === 0) return [];

      // Get profile info for each student
      const profileIds = members.map(m => m.profile_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, grade_year, avatar_url')
        .in('id', profileIds);

      if (profilesError) throw profilesError;

      return profiles.map(p => ({
        id: p.id,
        name: p.full_name || 'Aluno',
        grade: p.grade_year || 'Série não informada',
        avatarUrl: p.avatar_url || getAvatarEmoji(p.full_name),
      })) as FamilyChild[];
    },
    enabled: !!family?.id,
  });

  return {
    children: childrenQuery.data || [],
    isLoading: isLoadingFamily || childrenQuery.isLoading,
    hasChildren: (childrenQuery.data?.length || 0) > 0,
  };
};

// Helper function to generate a consistent avatar emoji based on name
function getAvatarEmoji(name: string | null): string {
  const emojis = ['👦', '👧', '👦🏻', '👧🏻', '👦🏽', '👧🏽', '👦🏿', '👧🏿'];
  if (!name) return emojis[0];
  const index = name.charCodeAt(0) % emojis.length;
  return emojis[index];
}
