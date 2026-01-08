import { supabase } from './supabaseClient';

export const signUpUser = async (email: string, pass: string, fullName: string, role: string) => {
    // 1. Supabase Auth mein user create karein
    const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
    });

    if (error) throw error;

    // 2. Agar auth successful hai, toh profiles table mein role save karein
    if (data.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                { id: data.user.id, full_name: fullName, role: role }
            ]);

        if (profileError) throw profileError;
    }

    return data;
};

export const signInUser = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
    });

    if (error) throw error;
    return data;
};

export const getUserRole = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data?.role;
};
