import { supabase } from './supabaseClient';

export const signUpUser = async (
    email: string,
    pass: string,
    fullName: string,
    role: string,
    academicYear?: string,
    section?: string,
    collegeId?: string
) => {
    // 1. Supabase Auth mein user create karein
    const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
            data: {
                full_name: fullName,
                name: fullName, // Provide both to satisfy any triggers
                email: email,
                role: role,
                academic_year: academicYear,
                academicYear: academicYear, // camelCase fallback
                section: section,
                college_id: collegeId,
                collegeId: collegeId // camelCase fallback
            }
        }
    });

    if (error) throw error;

    // 2. Agar auth successful hai, toh profiles, students, and teachers tables update karein
    if (data.user) {
        // Update Profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert([
                {
                    id: data.user.id,
                    full_name: fullName,
                    role: role,
                    academic_year: academicYear || '2nd Year', // Prevent nulls
                    section: section || 'Section A',
                    college_id: collegeId || `ST${Math.floor(Math.random() * 10000)}`
                }
            ]);

        if (profileError) console.error("Profile Insert Error:", profileError);

        // Update specific table based on role to ensure they show up in dashboard
        if (role === 'student') {
            const { error: studentError } = await supabase
                .from('students')
                .upsert([
                    {
                        id: data.user.id,
                        full_name: fullName,
                        email: email,
                        academic_year: academicYear || '2nd Year',
                        section: section || 'Section A',
                        college_id: collegeId || `ST${Math.floor(Math.random() * 10000)}`
                    }
                ]);
            if (studentError) console.error("Student Insert Error:", studentError);
        } else if (role === 'teacher' || role === 'faculty') {
            const { error: teacherError } = await supabase
                .from('teachers')
                .upsert([
                    {
                        id: data.user.id,
                        full_name: fullName,
                        email: email,
                        department: 'Computer Science'
                    }
                ]);
            if (teacherError) console.error("Teacher Insert Error:", teacherError);
        }
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
