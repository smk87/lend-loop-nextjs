'use client';

import React from 'react';
import {
    ToolOutlined,
    SafetyCertificateOutlined,
    SyncOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import { Flex, Title, Paragraph, Card } from '@/app/components';
import { HeroAuthButtons } from './HeroAuthButtons';

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-[#001529] via-[#052e26]/80 to-[#001529] text-white border-b border-emerald-900/30">
            {/* Background Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

            <Flex
                vertical
                align="center"
                className="relative max-w-6xl mx-auto px-6 py-20 lg:py-24 text-center"
            >
                {/* Tagline Badge */}
                <Flex
                    align="center"
                    gap="small"
                    className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-medium mb-6"
                >
                    <ToolOutlined className="text-emerald-400" />
                    <span>Borrow what you need. Lend what you don’t.</span>
                </Flex>

                {/* Headline */}
                <Title
                    level={1}
                    className="!text-4xl sm:!text-5xl lg:!text-6xl !font-extrabold !tracking-tight !text-white !max-w-4xl !leading-tight sm:!leading-none !mb-0"
                >
                    Your Neighborhood{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                        Circular Tool Shed
                    </span>
                </Title>

                {/* Subhead */}
                <Paragraph className="mt-6 !text-base sm:!text-lg !text-slate-300 max-w-2xl !leading-relaxed !mb-0">
                    Why buy expensive equipment you will only use once or twice
                    a year? Share drills, pressure washers, camping tents, and
                    lawn gear with verified neighbors in a trusted, private
                    community loop.
                </Paragraph>

                {/* Interactive Auth Actions */}
                <HeroAuthButtons />

                {/* Trust Highlights */}
                <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl text-left">
                    <Card
                        className="!bg-white/5 !border-white/10 !backdrop-blur-sm"
                        styles={{ body: { padding: '16px' } }}
                    >
                        <Flex align="flex-start" gap="middle">
                            <SafetyCertificateOutlined className="text-2xl text-emerald-400 mt-1 flex-shrink-0" />
                            <Flex vertical gap={4}>
                                <Title
                                    level={5}
                                    className="!text-white !text-sm !font-semibold !m-0"
                                >
                                    Zero Identity Leaks
                                </Title>
                                <Paragraph className="!text-slate-300 !text-xs !leading-normal !m-0">
                                    Owner identities and home addresses are never
                                    published on the public catalog.
                                </Paragraph>
                            </Flex>
                        </Flex>
                    </Card>

                    <Card
                        className="!bg-white/5 !border-white/10 !backdrop-blur-sm"
                        styles={{ body: { padding: '16px' } }}
                    >
                        <Flex align="flex-start" gap="middle">
                            <SyncOutlined className="text-2xl text-emerald-400 mt-1 flex-shrink-0" />
                            <Flex vertical gap={4}>
                                <Title
                                    level={5}
                                    className="!text-white !text-sm !font-semibold !m-0"
                                >
                                    Smart Automation
                                </Title>
                                <Paragraph className="!text-slate-300 !text-xs !leading-normal !m-0">
                                    Instant webhook notifications and friendly
                                    automated return reminders keep loans on track.
                                </Paragraph>
                            </Flex>
                        </Flex>
                    </Card>

                    <Card
                        className="!bg-white/5 !border-white/10 !backdrop-blur-sm"
                        styles={{ body: { padding: '16px' } }}
                    >
                        <Flex align="flex-start" gap="middle">
                            <TeamOutlined className="text-2xl text-emerald-400 mt-1 flex-shrink-0" />
                            <Flex vertical gap={4}>
                                <Title
                                    level={5}
                                    className="!text-white !text-sm !font-semibold !m-0"
                                >
                                    100% Free Sharing
                                </Title>
                                <Paragraph className="!text-slate-300 !text-xs !leading-normal !m-0">
                                    Community-driven circular tool sharing with
                                    zero rental fees, deposits, or hidden costs.
                                </Paragraph>
                            </Flex>
                        </Flex>
                    </Card>
                </div>
            </Flex>
        </section>
    );
}
