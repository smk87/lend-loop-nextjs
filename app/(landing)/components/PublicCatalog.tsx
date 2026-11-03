'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Preloaded, usePreloadedQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { SignInButton, SignUpButton, Show } from '@clerk/nextjs';
import { Alert } from 'antd';
import {
    ToolOutlined,
    SearchOutlined,
    SafetyCertificateOutlined,
    ThunderboltOutlined,
    CompassOutlined,
    LockOutlined,
    AppstoreOutlined,
    ArrowRightOutlined,
    UserAddOutlined,
    FireOutlined,
    EnvironmentOutlined,
    ClearOutlined,
} from '@ant-design/icons';

import {
    Button,
    Title,
    Text,
    Paragraph,
    Badge,
    Input,
    Card,
    Tag,
    Empty,
    Tooltip,
    Flex,
} from '@/app/components';

type ToolCategory =
    'power tools' | 'garden' | 'kitchen' | 'camping' | 'hand tools' | 'other';

type ToolCondition = 'new' | 'like-new' | 'good' | 'fair';

interface CategoryConfig {
    label: string;
    icon: React.ReactNode;
    color: string;
}

const CATEGORY_MAP: Record<ToolCategory, CategoryConfig> = {
    'power tools': {
        label: 'Power Tools',
        icon: <ThunderboltOutlined />,
        color: 'blue',
    },
    garden: {
        label: 'Garden',
        icon: <EnvironmentOutlined />,
        color: 'green',
    },
    kitchen: {
        label: 'Kitchen',
        icon: <FireOutlined />,
        color: 'orange',
    },
    camping: {
        label: 'Camping',
        icon: <CompassOutlined />,
        color: 'purple',
    },
    'hand tools': {
        label: 'Hand Tools',
        icon: <ToolOutlined />,
        color: 'cyan',
    },
    other: {
        label: 'Other',
        icon: <AppstoreOutlined />,
        color: 'default',
    },
};

const CONDITION_MAP: Record<ToolCondition, { label: string; color: string }> = {
    new: { label: 'Brand New', color: 'success' },
    'like-new': { label: 'Like New', color: 'cyan' },
    good: { label: 'Good Condition', color: 'blue' },
    fair: { label: 'Fair Condition', color: 'warning' },
};

export interface PublicCatalogProps {
    preloadedTools: Preloaded<typeof api.tools.getPublicAvailable>;
}

export const PublicCatalog = ({ preloadedTools }: PublicCatalogProps) => {
    const router = useRouter();
    // Live reactive query seamlessly hydrated from preloaded server data
    const publicTools = usePreloadedQuery(preloadedTools);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Filter available tools by search query and category
    const filteredTools = useMemo(() => {
        if (!publicTools) return [];

        return publicTools.filter((tool) => {
            const matchesQuery =
                !searchQuery.trim() ||
                tool.name
                    .toLowerCase()
                    .includes(searchQuery.trim().toLowerCase());

            const matchesCategory =
                selectedCategory === 'all' ||
                tool.category === selectedCategory;

            return matchesQuery && matchesCategory;
        });
    }, [publicTools, searchQuery, selectedCategory]);

    // Calculate category counts
    const categoryCounts = useMemo(() => {
        if (!publicTools) return { all: 0 };
        const counts: Record<string, number> = { all: publicTools.length };
        publicTools.forEach((tool) => {
            counts[tool.category] = (counts[tool.category] || 0) + 1;
        });
        return counts;
    }, [publicTools]);

    const categoriesList: {
        key: string;
        label: string;
        icon?: React.ReactNode;
    }[] = [
        { key: 'all', label: 'All Categories', icon: <AppstoreOutlined /> },
        {
            key: 'power tools',
            label: 'Power Tools',
            icon: <ThunderboltOutlined />,
        },
        { key: 'garden', label: 'Garden', icon: <EnvironmentOutlined /> },
        { key: 'kitchen', label: 'Kitchen', icon: <FireOutlined /> },
        { key: 'camping', label: 'Camping', icon: <CompassOutlined /> },
        { key: 'hand tools', label: 'Hand Tools', icon: <ToolOutlined /> },
        { key: 'other', label: 'Other', icon: <AppstoreOutlined /> },
    ];

    return (
        <Flex vertical gap="large">
            {/* Privacy & Data Minimization Notification Alert */}
            <Alert
                type="info"
                showIcon
                icon={
                    <SafetyCertificateOutlined className="text-primary text-lg" />
                }
                className="border-primary-border bg-primary-bg rounded-xl p-4 shadow-xs"
                title={
                    <span className="font-semibold text-text-heading text-sm">
                        Public Data Minimization Active
                    </span>
                }
                description={
                    <Paragraph type="secondary" className="text-xs mt-1 leading-relaxed mb-0">
                        This public catalog strictly displays equipment name,
                        category, and condition. To safeguard neighborhood
                        safety, owner contact details and exact handoff
                        locations are disclosed only to verified neighbors upon
                        loan approval.
                    </Paragraph>
                }
            />

            {/* Catalog Header & Filters */}
            <Flex vertical gap="middle">
                <Flex
                    justify="space-between"
                    align="flex-end"
                    wrap="wrap"
                    gap="middle"
                >
                    <Flex vertical gap={4}>
                        <Flex align="center" gap="small">
                            <Title
                                level={2}
                                className="mb-0 font-bold"
                            >
                                Available Neighborhood Tools
                            </Title>
                            <Tag
                                color="success"
                                className="rounded-full font-medium"
                            >
                                {publicTools.length} Live
                            </Tag>
                        </Flex>
                        <Paragraph type="secondary" className="mb-0 text-sm">
                            Browse real-time equipment currently available to
                            borrow right now.
                        </Paragraph>
                    </Flex>

                    {/* Search Input */}
                    <div className="w-full sm:w-72">
                        <Input
                            placeholder="Search available tools..."
                            prefix={
                                <SearchOutlined className="text-text-muted" />}
                            allowClear
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="rounded-lg"
                        />
                    </div>
                </Flex>

                {/* Category Filter Pills */}
                <Flex align="center" gap="small" wrap="wrap" className="pb-2">
                    {categoriesList.map((cat) => {
                        const isSelected = selectedCategory === cat.key;
                        const count = categoryCounts[cat.key] || 0;

                        return (
                            <button
                                key={cat.key}
                                type="button"
                                onClick={() => setSelectedCategory(cat.key)}
                                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border ${
                                    isSelected
                                        ? 'bg-primary text-text-light border-primary shadow-xs'
                                        : 'bg-surface text-text-secondary border-border-default hover:bg-canvas hover:text-text-main'
                                }`}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                                <span
                                    className={`px-1.5 py-0.2 rounded-full text-[11px] font-semibold ${
                                        isSelected
                                            ? 'bg-primary-active/40 text-text-light'
                                            : 'bg-border-subtle text-text-muted'
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}

                    {(selectedCategory !== 'all' || searchQuery.trim()) && (
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedCategory('all');
                                setSearchQuery('');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-text-muted hover:text-error hover:bg-error-bg transition-colors"
                        >
                            <ClearOutlined />
                            <span>Reset</span>
                        </button>
                    )}
                </Flex>
            </Flex>

            {/* TOOLS GRID */}
            {filteredTools.length === 0 ? (
                <Card className="rounded-2xl p-8 text-center shadow-sm">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <Flex vertical gap="small" className="max-w-md mx-auto">
                                <Text
                                    strong
                                    className="text-text-heading text-base block"
                                >
                                    {searchQuery.trim() ||
                                    selectedCategory !== 'all'
                                        ? 'No matching tools found'
                                        : 'No tools currently listed as available'}
                                </Text>
                                <Paragraph type="secondary" className="text-xs mb-0">
                                    {searchQuery.trim() ||
                                    selectedCategory !== 'all'
                                        ? 'Try searching for different keywords or select another category filter.'
                                        : 'Be the pioneer in your neighborhood! Sign in to share equipment with neighbors and earn a Trusted Lender badge.'}
                                </Paragraph>
                            </Flex>
                        }
                    >
                        {searchQuery.trim() || selectedCategory !== 'all' ? (
                            <Button
                                onClick={() => {
                                    setSelectedCategory('all');
                                    setSearchQuery('');
                                }}
                                icon={<ClearOutlined />}
                            >
                                Reset Filters
                            </Button>
                        ) : (
                            <Show when="signed-out">
                                <SignUpButton mode="modal">
                                    <Button
                                        type="primary"
                                        icon={<UserAddOutlined />}
                                    >
                                        Sign in to List a Tool
                                    </Button>
                                </SignUpButton>
                            </Show>
                        )}
                    </Empty>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTools.map((tool) => {
                        const catConfig = CATEGORY_MAP[
                            tool.category as ToolCategory
                        ] || {
                            label: tool.category,
                            icon: <ToolOutlined />,
                            color: 'default',
                        };

                        const condConfig = CONDITION_MAP[
                            tool.condition as ToolCondition
                        ] || {
                            label: tool.condition,
                            color: 'default',
                        };

                        return (
                            <Card
                                key={tool._id}
                                hoverable
                                className="rounded-xl border border-border-default hover:border-primary hover:shadow-md transition-all flex flex-col justify-between"
                                styles={{
                                    body: {
                                        padding: '20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%',
                                    },
                                }}
                            >
                                <Flex vertical justify="space-between" style={{ height: '100%' }}>
                                    <Flex vertical flex={1}>
                                        {/* Top Badges */}
                                        <Flex justify="space-between" align="center" gap="small" className="mb-3">
                                            <Tag
                                                color={catConfig.color}
                                                icon={catConfig.icon}
                                                className="rounded-md m-0 font-medium text-xs"
                                            >
                                                {catConfig.label}
                                            </Tag>
                                            <Tag
                                                color={condConfig.color}
                                                className="rounded-md m-0 text-xs"
                                            >
                                                {condConfig.label}
                                            </Tag>
                                        </Flex>

                                        {/* Tool Name */}
                                        <Title
                                            level={4}
                                            className="font-semibold mb-2 line-clamp-2"
                                            title={tool.name}
                                        >
                                            {tool.name}
                                        </Title>

                                        {/* Real-time Status Badge */}
                                        <Flex align="center" gap="small" className="mt-auto pt-2 pb-4">
                                            <Badge
                                                status="success"
                                                text="Available to borrow"
                                            />
                                        </Flex>

                                        {/* Privacy notice for card */}
                                        <Flex
                                            justify="space-between"
                                            align="center"
                                            className="pt-2 border-t border-border-subtle text-[11px] text-text-muted"
                                        >
                                            <Flex align="center" gap={4}>
                                                <SafetyCertificateOutlined className="text-primary" />
                                                <span>
                                                    Verified neighbor listing
                                                </span>
                                            </Flex>
                                            <span className="text-text-muted italic">
                                                Zero fees
                                            </span>
                                        </Flex>
                                    </Flex>

                                    {/* Action Button */}
                                    <div className="mt-4 pt-3 border-t border-border-subtle">
                                        <Show when="signed-out">
                                            <SignInButton mode="modal">
                                                <Button
                                                    type="primary"
                                                    block
                                                    icon={<LockOutlined />}
                                                >
                                                    Sign in to Borrow
                                                </Button>
                                            </SignInButton>
                                        </Show>

                                        <Show when="signed-in">
                                            <Tooltip title="Submit a borrow request for this tool">
                                                <Button
                                                    type="primary"
                                                    block
                                                    icon={<ArrowRightOutlined />}
                                                    onClick={() =>
                                                        router.push('/dashboard')
                                                    }
                                                >
                                                    Borrow This Tool
                                                </Button>
                                            </Tooltip>
                                        </Show>
                                    </div>
                                </Flex>
                            </Card>
                        );
                    })}
                </div>
            )}
        </Flex>
    );
}
