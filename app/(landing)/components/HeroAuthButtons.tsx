'use client';

import { useRouter } from 'next/navigation';
import { SignInButton, SignUpButton, Show } from '@clerk/nextjs';
import {
    UserAddOutlined,
    LoginOutlined,
    DashboardOutlined,
    AppstoreOutlined,
} from '@ant-design/icons';
import { Button, Flex } from '@/app/components';

export function HeroAuthButtons() {
    const router = useRouter();

    return (
        <Flex
            wrap="wrap"
            align="center"
            justify="center"
            gap="middle"
            className="mt-8"
        >
            <Show when="signed-out">
                <SignUpButton mode="modal">
                    <Button
                        type="primary"
                        size="large"
                        icon={<UserAddOutlined />}
                        className="h-12 px-7 font-semibold text-base shadow-lg"
                    >
                        Join Neighborhood
                    </Button>
                </SignUpButton>

                <SignInButton mode="modal">
                    <Button
                        size="large"
                        icon={<LoginOutlined />}
                        className="h-12 px-7 font-semibold text-base bg-surface/10 border-border-default/20 text-text-light hover:bg-surface/15"
                    >
                        Sign In to Lend or Borrow
                    </Button>
                </SignInButton>
            </Show>

            <Show when="signed-in">
                <Button
                    type="primary"
                    size="large"
                    icon={<DashboardOutlined />}
                    onClick={() => router.push('/dashboard')}
                    className="h-12 px-7 font-semibold text-base shadow-lg"
                >
                    Open My Dashboard
                </Button>

                <a href="#public-catalog">
                    <Button
                        size="large"
                        icon={<AppstoreOutlined />}
                        className="h-12 px-7 font-semibold text-base bg-surface/10 border-border-default/20 text-text-light hover:bg-surface/15"
                    >
                        Browse Available Tools
                    </Button>
                </a>
            </Show>
        </Flex>
    );
}
