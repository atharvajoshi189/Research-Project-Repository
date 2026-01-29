import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

export function useRealtimeProjects(userId: string | null, role: string | null) {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch Logic Extracted for Reusability & Clarity
    const getProjectsByRole = async (uid: string, userRole: string) => {
        let query = supabase.from('projects').select('*').order('created_at', { ascending: false });

        if (userRole === 'teacher') {
            // Teacher: Strictly their own projects
            query = query.eq('guide_id', uid);
        } else if (userRole === 'hod' || userRole === 'admin') {
            // HOD/Admin: ALL projects (Implicitly includes guide_id IS NULL)
            // No filter needed
        } else if (userRole === 'student') {
            // Student: Usually handled by dashboard logic (collaborators), but if needed here:
            // This hook is primarily for "Management" views (Teacher/HOD), but can be extended.
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    };

    const fetchProjects = async () => {
        if (!userId || !role) return;
        try {
            setLoading(true);
            const data = await getProjectsByRole(userId, role);
            setProjects(data);
            setError(null);
        } catch (err: any) {
            console.error("Error fetching realtime projects:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();

        // Real-time Subscription
        const channel = supabase
            .channel('realtime_projects')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
                console.log('Realtime Change:', payload);
                // Simple strategy: Re-fetch on any change for consistency
                fetchProjects();

                if (payload.eventType === 'INSERT') {
                    toast('New project activity detected.', { icon: '🔔' });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, role]);


    return { projects, loading, error, refetch: fetchProjects };
}
