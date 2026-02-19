import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useCallback, useEffect } from 'react';

// IMPORTANTE: Frontend NÃO faz INSERT direto em families/family_members
// Todas as operações de família devem usar as RPCs:
// - create_family_for_parent(parent_id)
// - join_family_by_code(profile_id, code)

export const useFamily = () => {
  const { user, roles } = useAuth();
  const queryClient = useQueryClient();

  const familyQuery = useQuery({
    queryKey: ['family', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('family_id, member_role')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (memberError) throw memberError;
      if (!memberData) return null;

      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('id', memberData.family_id)
        .maybeSingle();

      if (familyError) throw familyError;

      return {
        ...familyData,
        memberRole: memberData.member_role,
      };
    },
    enabled: !!user,
  });

  // Count children in family (for parent banner logic)
  const childrenCountQuery = useQuery({
    queryKey: ['family-children-count', familyQuery.data?.id],
    queryFn: async () => {
      if (!familyQuery.data?.id) return 0;
      
      const { count, error } = await supabase
        .from('family_members')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyQuery.data.id)
        .eq('member_role', 'student');
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!familyQuery.data?.id,
  });

  const createFamilyMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('create_family_for_parent', {
        parent_id: user.id,
      });

      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family'] });
    },
  });

  const joinFamilyMutation = useMutation({
    mutationFn: async (code: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('join_family_by_code', {
        p_profile_id: user.id,
        p_code: code,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family'] });
      queryClient.invalidateQueries({ queryKey: ['family-children-count'] });
    },
  });

  // Auto-create family for parent if they don't have one
  const ensureFamilyExists = useCallback(async () => {
    const isParent = roles?.includes('parent');
    if (!isParent) return;
    if (familyQuery.data) return; // Already has family
    if (familyQuery.isLoading) return; // Still loading
    if (createFamilyMutation.isPending) return; // Already creating
    
    try {
      await createFamilyMutation.mutateAsync();
    } catch (error) {
      // Silently fail - user might already belong to a family
      console.log('Family creation skipped:', error);
    }
  }, [familyQuery.data, familyQuery.isLoading, createFamilyMutation, roles]);

  return {
    family: familyQuery.data,
    isLoading: familyQuery.isLoading,
    childrenCount: childrenCountQuery.data ?? 0,
    isLoadingChildren: childrenCountQuery.isLoading,
    createFamily: createFamilyMutation.mutateAsync,
    isCreating: createFamilyMutation.isPending,
    joinFamily: joinFamilyMutation.mutateAsync,
    isJoining: joinFamilyMutation.isPending,
    ensureFamilyExists,
  };
};
