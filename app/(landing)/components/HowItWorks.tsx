import { Flex, Title, Paragraph, Card } from '@/app/components';

export const HowItWorks = () => {
    return (
        <section className="mt-12 pt-12 border-t border-border-default">
            <Flex
                vertical
                align="center"
                className="text-center max-w-2xl mx-auto mb-10"
            >
                <Title
                    level={2}
                    className="text-2xl sm:text-3xl font-bold tracking-tight mb-0"
                >
                    How LendLoop Works
                </Title>
                <Paragraph type="secondary" className="text-sm mt-2 mb-0">
                    Borrowing and sharing tools in your neighborhood is simple,
                    safe, and transparent.
                </Paragraph>
            </Flex>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card
                    className="rounded-2xl shadow-sm"
                    styles={{ body: { padding: '24px' } }}
                >
                    <Flex vertical>
                        <Flex
                            align="center"
                            justify="center"
                            className="w-12 h-12 rounded-xl bg-primary-bg text-primary border border-primary-border text-xl font-bold mb-4"
                        >
                            1
                        </Flex>
                        <Title
                            level={4}
                            className="font-semibold text-base mb-2"
                        >
                            Discover Equipment
                        </Title>
                        <Paragraph
                            type="secondary"
                            className="text-xs leading-relaxed m-0"
                        >
                            Browse your neighborhood&apos;s shared catalog for
                            power tools, garden gear, and kitchen equipment
                            right around the block.
                        </Paragraph>
                    </Flex>
                </Card>

                <Card
                    className="rounded-2xl shadow-sm"
                    styles={{ body: { padding: '24px' } }}
                >
                    <Flex vertical>
                        <Flex
                            align="center"
                            justify="center"
                            className="w-12 h-12 rounded-xl bg-primary-bg text-primary border border-primary-border text-xl font-bold mb-4"
                        >
                            2
                        </Flex>
                        <Title
                            level={4}
                            className="font-semibold text-base mb-2"
                        >
                            Reserve Your Dates
                        </Title>
                        <Paragraph
                            type="secondary"
                            className="text-xs leading-relaxed m-0"
                        >
                            Sign in and pick your project dates. The lender
                            receives an instant webhook notification to review
                            and approve your request.
                        </Paragraph>
                    </Flex>
                </Card>

                <Card
                    className="rounded-2xl shadow-sm"
                    styles={{ body: { padding: '24px' } }}
                >
                    <Flex vertical>
                        <Flex
                            align="center"
                            justify="center"
                            className="w-12 h-12 rounded-xl bg-primary-bg text-primary border border-primary-border text-xl font-bold mb-4"
                        >
                            3
                        </Flex>
                        <Title
                            level={4}
                            className="font-semibold text-base mb-2"
                        >
                            Return & Keep the Loop Going
                        </Title>
                        <Paragraph
                            type="secondary"
                            className="text-xs leading-relaxed m-0"
                        >
                            Pick up the tool, finish your project, and return it
                            safely. Daily automated reminders make sure
                            equipment is never forgotten.
                        </Paragraph>
                    </Flex>
                </Card>
            </div>
        </section>
    );
}
