'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SignInButton, SignUpButton, UserButton, Show } from '@clerk/nextjs';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
    ToolOutlined,
    AppstoreOutlined,
    DashboardOutlined,
    SafetyCertificateOutlined,
    CrownOutlined,
    LoginOutlined,
    UserAddOutlined,
} from '@ant-design/icons';
import { Button, Tag, Tooltip, Flex, Text } from '@/app/components';

const { Header } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

export const Navbar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();

    const { isAuthenticated } = useConvexAuth();
    const storeUser = useMutation(api.users.storeUser);
    const userProfile = useQuery(
        api.users.currentUser,
        isAuthenticated ? {} : 'skip',
    );

    // Sync authenticated Clerk user profile into Convex
    useEffect(() => {
        if (isAuthenticated) {
            storeUser().catch((err: unknown) => {
                console.error('Failed to sync user with Convex:', err);
            });
        }
    }, [isAuthenticated, storeUser]);

    // Active key calculation for Menu component
    const currentKey = pathname.startsWith('/admin')
        ? '/admin'
        : pathname.startsWith('/dashboard')
        ? '/dashboard'
        : '/';

    const menuItems: MenuItem[] = [
        {
            key: '/',
            icon: <AppstoreOutlined />,
            label: 'Catalog',
        },
        ...(isAuthenticated
            ? [
                  {
                      key: '/dashboard',
                      icon: <DashboardOutlined />,
                      label: 'My Loans & Requests',
                  },
              ]
            : []),
        ...(isAuthenticated && userProfile?.role === 'admin'
            ? [
                  {
                      key: '/admin',
                      icon: <CrownOutlined />,
                      label: 'Admin Panel',
                  },
              ]
            : []),
    ];

    const handleMenuClick: MenuProps['onClick'] = (e) => {
        router.push(e.key);
    };

    return (
        <Header
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                width: '100%',
                padding: '0 24px',
                height: '64px',
                lineHeight: '64px',
                backgroundColor: '#001529',
            }}
            className="bg-[#001529] shadow-md transition-all border-b border-slate-800"
        >
            <Flex
                align="center"
                justify="space-between"
                style={{ height: '100%', width: '100%' }}
            >
                {/* Brand & Logo */}
                <Flex align="center" className="shrink-0 mr-8">
                    <Link
                        href="/"
                        className="group no-underline transition-transform hover:scale-[1.01]"
                    >
                        <Flex align="center" gap="middle">
                            <Flex
                                align="center"
                                justify="center"
                                className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-950/60 group-hover:shadow-emerald-500/40 transition-all shrink-0"
                            >
                                <ToolOutlined className="text-xl" />
                            </Flex>
                            <Flex
                                vertical
                                justify="center"
                                style={{ lineHeight: 1.2 }}
                            >
                                <Flex align="center" gap="small">
                                    <span className="text-xl font-black tracking-tight text-white">
                                        Lend
                                        <span className="text-emerald-400">
                                            Loop
                                        </span>
                                    </span>
                                    <Tag
                                        color="success"
                                        className="!m-0 !rounded-full !text-[11px] !font-semibold !bg-emerald-950/80 !text-emerald-300 !border-emerald-800/80"
                                    >
                                        Neighborhood Sharing
                                    </Tag>
                                </Flex>
                                <Text className="!text-[11px] font-medium !text-emerald-200/75 !mb-0">
                                    Borrow what you need. Lend what you don’t.
                                </Text>
                            </Flex>
                        </Flex>
                    </Link>
                </Flex>

                {/* Dark Horizontal Menu following Ant Design layout-demo-top */}
                <Flex flex={1} style={{ minWidth: 0 }}>
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        selectedKeys={[currentKey]}
                        onClick={handleMenuClick}
                        items={menuItems}
                        style={{
                            flex: 1,
                            minWidth: 0,
                            backgroundColor: '#001529',
                            borderBottom: 'none',
                            lineHeight: '64px',
                        }}
                        className="font-medium"
                    />
                </Flex>

                {/* Right Controls: Badges & Clerk Authentication */}
                <Flex align="center" gap="middle" className="shrink-0 ml-4">
                    <Show when="signed-in">
                        {userProfile?.isTrustedLender && (
                            <Tooltip title="Verified Trusted Lender in your neighborhood">
                                <Tag
                                    color="gold"
                                    icon={<SafetyCertificateOutlined />}
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 font-semibold rounded-full shadow-xs"
                                >
                                    Trusted Lender
                                </Tag>
                            </Tooltip>
                        )}

                        {userProfile?.role === 'admin' && (
                            <Tag
                                color="purple"
                                icon={<CrownOutlined />}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 font-semibold rounded-full shadow-xs"
                            >
                                Admin
                            </Tag>
                        )}

                        <Flex
                            align="center"
                            className="pl-2 border-l border-slate-700/60"
                        >
                            <UserButton
                                appearance={{
                                    elements: {
                                        userButtonAvatarBox:
                                            'h-9 w-9 ring-2 ring-emerald-500/50 hover:ring-emerald-400 transition-all',
                                    },
                                }}
                            />
                        </Flex>
                    </Show>

                    <Show when="signed-out">
                        <Flex align="center" gap="small">
                            <SignInButton mode="modal">
                                <Button
                                    icon={<LoginOutlined />}
                                    ghost
                                    className="border-slate-600 text-slate-200 hover:!text-white hover:!border-emerald-400"
                                >
                                    Sign In
                                </Button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <Button
                                    type="primary"
                                    icon={<UserAddOutlined />}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-md shadow-emerald-950/60"
                                >
                                    Get Started
                                </Button>
                            </SignUpButton>
                        </Flex>
                    </Show>
                </Flex>
            </Flex>
        </Header>
    );
};
