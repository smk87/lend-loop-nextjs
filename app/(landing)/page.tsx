'use client';

import { Typography } from 'antd';
import { Button } from '../components/atoms/Button/Button';

const { Title } = Typography;

export default function Home() {
    return (
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-white">
            <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-red sm:items-start">
                <Title className="mx-auto">Lend Loop App</Title>

                {/* Render component to test here */}
                <div className="mx-auto">
                    <Button className="text-green-900">Test Button 1</Button>
                </div>
            </main>
        </div>
    );
}
