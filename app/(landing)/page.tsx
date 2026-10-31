import { Input, Title, Button } from '../components/atoms';

export default function Home() {
    return (
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-white">
            <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-red sm:items-start">
                {/* Render component to test here */}
                <div className="mx-auto flex flex-col items-center">
                    <Title className="mx-auto">Lend Loop App</Title>
                    <Button className="text-green-900">Test Button 1</Button>
                    <Input placeholder="type something" variant="outlined" />
                </div>
            </main>
        </div>
    );
}
