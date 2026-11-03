import {
    ToolOutlined,
    SafetyCertificateOutlined,
    SyncOutlined,
    TeamOutlined,
    Flex,
    Title,
    Paragraph,
    Card,
} from '@/app/components';
import { HeroAuthButtons } from './HeroAuthButtons';

export const HeroSection = () => {
    return (
        <section
            style={{
                backgroundImage:
                    'linear-gradient(to bottom, var(--ant-header-bg), var(--ant-dark-surface), var(--ant-header-bg))',
            }}
            className="relative overflow-hidden bg-header-bg bg-gradient-to-b from-header-bg via-dark-surface to-header-bg text-text-light border-b border-header-border"
        >
            {/* Background Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-primary/10 blur-3xl pointer-events-none rounded-full" />

            <Flex
                vertical
                align="center"
                className="relative max-w-6xl mx-auto px-6 py-20 lg:py-24 text-center"
            >
                {/* Tagline Badge */}
                <Flex
                    align="center"
                    gap="small"
                    className="px-3.5 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary-hover text-xs sm:text-sm font-medium mb-6"
                >
                    <ToolOutlined className="text-primary-hover" />
                    <span>Borrow what you need. Lend what you don’t.</span>
                </Flex>

                {/* Headline */}
                <Title
                    level={1}
                    className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-light max-w-4xl leading-tight sm:leading-none mb-0"
                >
                    Your Neighborhood{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-hover to-primary-border">
                        Circular Tool Shed
                    </span>
                </Title>

                {/* Subhead */}
                <Paragraph className="mt-6 text-base sm:text-lg text-text-light/80 max-w-2xl leading-relaxed mb-0">
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
                        className="bg-surface/5 border-border-default/15 backdrop-blur-sm"
                        styles={{ body: { padding: '16px' } }}
                    >
                        <Flex align="flex-start" gap="middle">
                            <SafetyCertificateOutlined className="text-2xl text-primary-hover mt-1 flex-shrink-0" />
                            <Flex vertical gap={4}>
                                <Title
                                    level={5}
                                    className="text-text-light text-sm font-semibold m-0"
                                >
                                    Zero Identity Leaks
                                </Title>
                                <Paragraph className="text-text-light/70 text-xs leading-normal m-0">
                                    Owner identities and home addresses are
                                    never published on the public catalog.
                                </Paragraph>
                            </Flex>
                        </Flex>
                    </Card>

                    <Card
                        className="bg-surface/5 border-border-default/15 backdrop-blur-sm"
                        styles={{ body: { padding: '16px' } }}
                    >
                        <Flex align="flex-start" gap="middle">
                            <SyncOutlined className="text-2xl text-primary-hover mt-1 flex-shrink-0" />
                            <Flex vertical gap={4}>
                                <Title
                                    level={5}
                                    className="text-text-light text-sm font-semibold m-0"
                                >
                                    Smart Automation
                                </Title>
                                <Paragraph className="text-text-light/70 text-xs leading-normal m-0">
                                    Instant webhook notifications and friendly
                                    automated return reminders keep loans on
                                    track.
                                </Paragraph>
                            </Flex>
                        </Flex>
                    </Card>

                    <Card
                        className="bg-surface/5 border-border-default/15 backdrop-blur-sm"
                        styles={{ body: { padding: '16px' } }}
                    >
                        <Flex align="flex-start" gap="middle">
                            <TeamOutlined className="text-2xl text-primary-hover mt-1 flex-shrink-0" />
                            <Flex vertical gap={4}>
                                <Title
                                    level={5}
                                    className="text-text-light text-sm font-semibold m-0"
                                >
                                    100% Free Sharing
                                </Title>
                                <Paragraph className="text-text-light/70 text-xs leading-normal m-0">
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
