import type { Metadata } from 'next';
import './globals.css';
import { Suspense } from 'react';
import { AllProviders } from './components/compound/AllProviders/AllProvider';
import { Navbar } from './components/compound/Navbar';

export const metadata: Metadata = {
    title: 'LendLoop - Neighborhood Tool Lending',
    description:
        'Borrow what you need. Lend what you don’t. A friendly neighborhood tool-sharing platform.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html lang="en" className={'h-full antialiased'}>
            <body className="min-h-full flex flex-col bg-slate-50/50 text-slate-800">
                <Suspense fallback={null}>
                    <AllProviders>
                        <Navbar />
                        <main className="flex-1 flex flex-col">{children}</main>
                    </AllProviders>
                </Suspense>
            </body>
        </html>
    );
}
