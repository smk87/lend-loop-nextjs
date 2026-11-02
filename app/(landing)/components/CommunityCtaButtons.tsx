'use client';

import { useRouter } from 'next/navigation';
import { SignUpButton, Show } from '@clerk/nextjs';
import { Button, Flex } from '@/app/components';

export function CommunityCtaButtons() {
    const router = useRouter();

    return (
        <Flex align="center" className="flex-shrink-0">
            <Show when="signed-out">
                <SignUpButton mode="modal">
                    <Button
                        size="large"
                        className="bg-surface text-primary-active border-none font-semibold hover:bg-primary-bg h-12 px-6 shadow"
                    >
                        Join the Community
                    </Button>
                </SignUpButton>
            </Show>

            <Show when="signed-in">
                <Button
                    size="large"
                    onClick={() => router.push('/dashboard')}
                    className="bg-surface text-primary-active border-none font-semibold hover:bg-primary-bg h-12 px-6 shadow"
                >
                    Manage My Tools
                </Button>
            </Show>
        </Flex>
    );
}
