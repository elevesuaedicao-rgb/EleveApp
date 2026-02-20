
import { supabase } from '@/integrations/supabase/client';

export const logAnalyticsEvent = async (userId: string, eventType: string, metadata: any = {}) => {
    try {
        await supabase.from('analytics_events').insert({
            user_id: userId,
            event_type: eventType,
            metadata
        });
    } catch (err) {
        console.error('Error logging analytics event:', err);
    }
};
