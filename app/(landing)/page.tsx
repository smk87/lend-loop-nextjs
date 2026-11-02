import { connection } from 'next/server';
import { preloadQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { HeroSection } from './components/HeroSection';
import { CommunityCtaButtons } from './components/CommunityCtaButtons';
import { HowItWorks } from './components/HowItWorks';
import { PublicCatalog } from './components/PublicCatalog';

export default async function LandingPage() {
    await connection();
    // True server-side data fetching for instant first paint, complete SEO, and zero spinner flash
    const preloadedTools = await preloadQuery(api.tools.getPublicAvailable, {});

    return (
        <div className="flex flex-col flex-1 w-full bg-slate-50">
            {/* HERO SECTION */}
            <HeroSection />

            {/* MAIN CONTENT / CATALOG */}
            <main
                id="public-catalog"
                className="max-w-6xl w-full mx-auto px-6 py-12 flex-1 flex flex-col gap-8"
            >
                {/* Client-hydrated reactive catalog with preloaded server data */}
                <PublicCatalog preloadedTools={preloadedTools} />

                {/* Pure Server Component: How It Works */}
                <HowItWorks />

                {/* BOTTOM COMMUNITY BANNER */}
                <section className="mt-8 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
                    <div className="space-y-2 text-center sm:text-left">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                            Have tools sitting idle in your garage?
                        </h2>
                        <p className="text-emerald-100 text-sm mb-0 max-w-xl">
                            Share what you don’t use, help your neighbors with
                            their weekend projects, and earn community
                            recognition with a Trusted Lender badge.
                        </p>
                    </div>

                    <CommunityCtaButtons />
                </section>
            </main>
        </div>
    );
}
