'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import withAuth from "@/lib/withAuth";
import { ArrowUpCircle, PlusCircle } from "lucide-react";
import Link from "next/link";
import TaskCard from "./components/TaskCard";
import TemplateCard from "./components/TemplateCard";
import { Template } from "@/types/tasks.types";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import PaginationComponent from "./components/Pagination";
import { useUser } from "@/hooks/useUser";
import { templates } from "@/lib/templates";

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

function DashboardPage() {
    const [tasks, setTasks] = useState<Task[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const totalPages = Math.ceil(tasks.length / itemsPerPage);
    const { user } = useUser();

    const paginatedTasks = tasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        const fetchTasks = async () => {
            if (!user)
                return;
            const url = `${apiUrl}/tasks/user/${user.id}`;
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    console.error('Failed to fetch tasks');
                    return;
                }
                const data = await res.json();
                setTasks(data);
            } catch (err) {
                console.error('Failed to fetch tasks', err);
            }
        };

        fetchTasks();
    }, [user]);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) {
            return;
        }
        setCurrentPage(page);
    }

    const onDeleteTask = (task: Task) => {
        setTasks(tasks.filter(t => t.id !== task.id));
    }

    return (
        <div className="space-y-12 pb-20">
            <h2 className="text-3xl font-bold">Dashboard</h2>

            <Card className="max-w-lg mx-auto">
                <CardHeader>
                    <CardTitle>Create a new Task</CardTitle>
                    <CardDescription>Start automating your workflows</CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/editor/new" passHref>
                        <Button className="w-full" size="lg">
                            <PlusCircle size={24} className="mr-2" />
                            Create New Task
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            <div>
                <h3 className="text-2xl font-semibold mb-8">Create from a template</h3>
                <Carousel className="w-full">
                    <CarouselContent>
                        {templates.map(template => (
                            <CarouselItem key={template.id} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                <TemplateCard template={template} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>

            <div>
                <div className="flex justify-between">
                    <div className="flex items-center gap-5 w-full mb-8">
                        <h3 className="text-2xl font-semibold">Your tasks</h3>
                        {user?.plan === 'free' && (
                            <>
                                <p className={`text-lg ${tasks.length >= 10 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {tasks.length} / 10
                                </p>
                                {tasks.length >= 10 && (
                                    <Link href="/pricing" passHref>
                                        <Button type="button">
                                            <ArrowUpCircle size={20} className="mr-2" />
                                            Upgrade Plan
                                        </Button>
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                    {totalPages > 1 &&
                        <PaginationComponent
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    }
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {paginatedTasks.map(task => (
                        <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
                    ))}
                </div>
                {tasks.length === 0 && (
                    <div className="flex justify-center mt-8">
                        <p className="text-lg text-gray-500 dark:text-gray-400">You have no tasks yet. Create one now!</p>
                    </div>
                )}
            </div>

        </div>
    );
}

export default withAuth(DashboardPage);
