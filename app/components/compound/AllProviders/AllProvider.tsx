'use client';

import { ThemeProvider } from '@/app/styles/ThemeProvider';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { PropsWithChildren, useMemo } from 'react';

const convexUrl =
    process.env.NEXT_PUBLIC_CONVEX_URL || 'https://placeholder.convex.cloud';

export const AllProviders = ({ children }: PropsWithChildren) => {
    const convex = useMemo(() => new ConvexReactClient(convexUrl), []);

    return (
        <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        >
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <AntdRegistry layer>
                    <ThemeProvider>{children}</ThemeProvider>
                </AntdRegistry>
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
};
