'use client'

import dynamic from 'next/dynamic';

const Plans = dynamic(() => import('./components/Plans'), { ssr: false });

export default function PricingPage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-3xl font-bold text-center mb-12 dark:text-white">Choose Your Plan</h1>
            <Plans />
        </div>
      )
}