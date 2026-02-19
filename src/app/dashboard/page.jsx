"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import DashboardView from '../components/DashboardView';

function DashboardRedirector() {
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(true);

    useEffect(() => {
        // Redirect to the user's public profile (which acts as their dashboard)
        const sId = typeof window !== 'undefined' ? sessionStorage.getItem("wb.steamid") : null;

        if (sId) {
            router.push(`/${sId}`);
        } else {
            // If not logged in, we stay here and let DashboardView show the "Sign In" state
            // Or we could redirect to home. But DashboardView handles "not logged in" gracefully.
            setIsRedirecting(false);
        }
    }, [router]);

    if (isRedirecting) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">Redirecting to Profile...</p>
            </div>
        );
    }

    return <DashboardView />;
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            </div>
        }>
            <DashboardRedirector />
        </Suspense>
    );
}
