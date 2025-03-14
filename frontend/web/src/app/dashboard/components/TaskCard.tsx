import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useAppLogo } from "@/hooks/useAppLogos";
import getFancyName from "@/lib/FancyNames";
import { useRouter } from "next/navigation";
import Link from 'next/link';


type Task = {
    event_hash: string;
    id: number;
    user_id: number;
    oauth_token: string;
    trigger_args: string[];
    trigger: string;
    action_name: string;
    requires_oauth: boolean;
    service: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type TaskCardProps = {
    task: Task;
    onDelete: (task: Task) => void;
};

export default function TaskCard({ task, onDelete }: TaskCardProps) {
    const router = useRouter();

    const { getAppLogo } = useAppLogo();

    function onDeleteTask(event: React.MouseEvent<HTMLButtonElement>) {
        event.stopPropagation();

        const url = `${apiUrl}/tasks/${task.id}`;
        fetch(url, { method: 'DELETE' })
            .then((res) => {
                if (!res.ok) {
                    console.error('Failed to delete task');
                    return;
                }
                onDelete(task);
            })
            .catch((err) => {
                console.error('Failed to delete task', err);
            });
    }

    return (
        <Link href={`/editor/${task.id}`} passHref>
            <Card
                className="flex flex-col justify-between transition-shadow hover:shadow-lg"
                role="button"
                tabIndex={0}
            >
                <CardHeader>
                    <CardTitle>{getFancyName(task.trigger)}</CardTitle>
                    <CardDescription>{getFancyName(task.action_name)}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between">
                    <div className="flex space-x-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Image src={getAppLogo(task.service)} alt={task.service} width={24} height={24} />
                                </TooltipTrigger>
                                <TooltipContent>{getFancyName(task.service)}</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <Button variant="outline" size="icon" aria-label="Delete Task" onClick={onDeleteTask}>
                        <Trash size={24} className="text-red-700" />
                    </Button>
                </CardContent>
            </Card>
        </Link>
    );
}
