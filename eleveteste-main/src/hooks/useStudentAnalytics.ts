
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface StudentAgreement {
    student_id: string;
    price_remote_60: number;
    price_remote_90: number;
    price_person_60: number;
    price_person_90: number;
}

export interface StudentProjection {
    real_count: number;
    real_value: number;
    historical_avg_count: number;
    historical_avg_value: number;
}

export interface TopicMetric {
    topic_name: string;
    difficulty_ema: number;
    trend: 'improving' | 'stable' | 'worsening';
    last_practiced_at: string;
}

export interface BillingCycle {
    id: string;
    start_date: string;
    end_date: string;
    status: 'open' | 'closed' | 'paid';
    adjustments?: BillingAdjustment[];
}

export interface BillingAdjustment {
    id: string;
    type: 'credit' | 'discount' | 'bonus';
    amount: number;
    reason: string;
}

export const useStudentAnalytics = (studentId: string) => {
    const { user } = useAuth(); // Ensure user is authenticated
    const queryClient = useQueryClient();

    // 1. Get Agreement
    const agreementQuery = useQuery({
        queryKey: ['student-agreement', studentId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('student_agreements')
                .select('*')
                .eq('student_id', studentId)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // Allow 404 (not found)
            return data as StudentAgreement | null;
        },
        enabled: !!studentId,
    });

    // 2. Get Topic Metrics
    const topicsQuery = useQuery({
        queryKey: ['student-topics', studentId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('student_topic_metrics')
                .select('*')
                .eq('student_id', studentId)
                .order('last_practiced_at', { ascending: false });

            if (error) throw error;
            return data as TopicMetric[];
        },
        enabled: !!studentId,
    });

    // 3. Get Billing Cycles
    const billingQuery = useQuery({
        queryKey: ['billing-cycles', studentId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('billing_cycles')
                .select(`
          *,
          adjustments:billing_adjustments(*)
        `)
                .eq('student_id', studentId)
                .order('start_date', { ascending: false });

            if (error) throw error;
            return data as BillingCycle[];
        },
        enabled: !!studentId,
    });

    // RPC: Get Projection
    const getProjection = async (start: Date, end: Date) => {
        const { data, error } = await supabase.rpc('get_student_projection', {
            p_student_id: studentId,
            p_start_date: start,
            p_end_date: end,
        });
        if (error) throw error;
        return data as StudentProjection;
    };

    // Mutations
    const updateAgreementMutation = useMutation({
        mutationFn: async (agreement: StudentAgreement) => {
            const { error } = await supabase.rpc('create_or_update_student_agreement', {
                p_student_id: agreement.student_id,
                p_price_remote_60: agreement.price_remote_60,
                p_price_remote_90: agreement.price_remote_90,
                p_price_person_60: agreement.price_person_60,
                p_price_person_90: agreement.price_person_90,
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-agreement', studentId] });
        },
    });

    const createBillingCycleMutation = useMutation({
        mutationFn: async (period: { start: string, end: string }) => {
            const { error } = await supabase.rpc('create_billing_cycle', {
                p_student_id: studentId,
                p_start_date: period.start,
                p_end_date: period.end,
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['billing-cycles', studentId] });
        },
    });

    const addAdjustmentMutation = useMutation({
        mutationFn: async (adj: { cycleId: string, type: 'credit' | 'discount' | 'bonus', amount: number, reason: string }) => {
            const { error } = await supabase.rpc('add_billing_adjustment', {
                p_cycle_id: adj.cycleId,
                p_type: adj.type,
                p_amount: adj.amount,
                p_reason: adj.reason,
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['billing-cycles', studentId] });
        },
    });

    const getBillingReport = async (cycleId: string) => {
        const { data, error } = await supabase.rpc('generate_billing_pdf_data', {
            p_cycle_id: cycleId,
        });
        if (error) throw error;
        return data;
    };

    return {
        agreement: agreementQuery.data,
        topics: topicsQuery.data || [],
        billingCycles: billingQuery.data || [],
        getProjection,
        getBillingReport,
        updateAgreement: updateAgreementMutation.mutateAsync,
        createBillingCycle: createBillingCycleMutation.mutateAsync,
        addAdjustment: addAdjustmentMutation.mutateAsync,
        isLoading: agreementQuery.isLoading || topicsQuery.isLoading || billingQuery.isLoading,
    };
};
