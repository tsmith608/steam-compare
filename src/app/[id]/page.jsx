"use client";
import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import DashboardView from '../components/DashboardView';

export default function DynamicProfilePage() {
    const params = useParams();
    const id = params.id;

    return (
        <div className="min-h-screen w-full flex flex-col relative selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">

            <Suspense fallback={
                <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">Scanning Steam Network...</p>
                </div>
            }>
                <DashboardView overrideSteamId={id} />
            </Suspense>
        </div>
    );
}
