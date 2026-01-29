'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.push('/login?view=signup');
    }, [router]);

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
