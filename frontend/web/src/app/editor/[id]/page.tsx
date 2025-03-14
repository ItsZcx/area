"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import withAuth from "@/lib/withAuth";
import {
    ReactFlow,
    Controls,
    Background,
    applyEdgeChanges,
    applyNodeChanges,
    NodeChange,
    EdgeChange,
    addEdge,
    Connection,
    ColorMode,
    Node,
    Edge,
    MarkerType,
    useReactFlow,
    FinalConnectionState,
    ReactFlowProvider,
} from "@xyflow/react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useState } from "react";
import TriggerNode from "./components/TriggerNode";
import ActionNode from "./components/ActionNode";
import { Button } from "@/components/ui/button";
import EditorSheet from "./components/EditorSheet";
import { Sheet } from "@/components/ui/sheet";
import { useUser } from "@/hooks/useUser";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useParams, useRouter } from "next/navigation";
import { ArrowUpCircle, Loader2, Save } from "lucide-react";
import { useServiceToken } from "@/hooks/useServiceToken";
import getServiceFromReaction from "@/lib/ServiceFromReaction";
import Link from "next/link";
import { getTemplateById, Template } from "@/lib/templates";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export interface NodeData {
    title?: string;
    service?: string;
    params?: { [key: string]: string; };
    [key: string]: unknown;
}

const initialNodes: Node<NodeData>[] = [
    {
        id: "1",
        data: { title: "", service: "" },
        position: { x: 300, y: 150 },
        type: "triggerNode",
    },
    {
        id: "2",
        data: { title: "", service: "" },
        position: { x: 350, y: 350 },
        type: "actionNode",
    },
];

const initialEdges: Edge[] = [
    {
        id: "e1-2",
        source: "1",
        target: "2",
        markerEnd: {
            type: MarkerType.ArrowClosed,
        },
    },
];

let id = 3;
const getId = () => `${id++}`;

function EditorPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [nbTasks, setNbTasks] = useState(0);

    const { theme } = useTheme();
    const nodeTypes = useMemo(
        () => ({ triggerNode: TriggerNode, actionNode: ActionNode }),
        []
    );

    const [openSheet, setOpenSheet] = useState(false);
    const [nodes, setNodes] = useState<Node<NodeData>[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const { screenToFlowPosition } = useReactFlow();

    const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
    const { user } = useUser();
    const { getServiceToken } = useServiceToken();

    const [dialogData, setDialogData] = useState<{ title: string; message: string; error: boolean } | null>(null);

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const url = `${apiUrl}/tasks/${id}`;
                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error("Failed to fetch task");
                }
                const data = await res.json();
                setNodes((prevNodes) => {
                    const updatedNodes = [...prevNodes];
                    updatedNodes[0].data = { title: data.trigger, service: data.service, params: { ...data.trigger_args } };
                    updatedNodes[1].data = { title: data.action_name, service: getServiceFromReaction(data.action_name), params: { ...data.action_params } };
                    return updatedNodes;
                });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        const fetchNbTasks = async () => {
            if (!user)
                return;
            const url = `${apiUrl}/tasks/user/${user.id}`;
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    console.error('Failed to fetch tasks');
                    return;
                }
                console.log(res);
                const data = await res.json();
                setNbTasks(data.length);
                console.log(data, data.length, nbTasks);
            } catch (err) {
                console.error('Failed to fetch tasks', err);
            } finally {
                setLoading(false);
            }
        };

        if (id === 'new' || id.includes('template')) {
            if (id !== 'new') {
                loadTemplate(getTemplateById(id));
            }
            fetchNbTasks();
        } else {
            setIsEditing(true);
            fetchTask();
        }
    }, [id, user]);

    function loadTemplate(template?: Template) {
        if (!template) return;
        setNodes((prevNodes) => {
            const updatedNodes = [...prevNodes];
            updatedNodes[0].data = { title: template.action, service: template.actionService };
            updatedNodes[1].data = { title: template.reaction, service: template.reactionService };
            return updatedNodes;
        });
    }

    const onNodesChange = useCallback(
        (changes: NodeChange<Node<NodeData>>[]) => {
            setNodes((nds) => {
                const firstNodeId = initialNodes[0].id;
                const isDeletingFirstNode = changes.some(
                    (change) => change.type === 'remove' && change.id === firstNodeId
                );

                if (isDeletingFirstNode) {
                    return nds;
                }

                return applyNodeChanges(changes, nds);
            });
        },
        [setNodes]
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange<Edge>[]) =>
            setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    );

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onConnectEnd = useCallback(
        (
            event: MouseEvent | TouchEvent,
            connectionState: FinalConnectionState
        ) => {
            if (!connectionState.isValid) {
                const id = getId();
                const { clientX, clientY } =
                    "changedTouches" in event ? event.changedTouches[0] : event;

                const newNode: Node<NodeData> = {
                    id,
                    position: screenToFlowPosition({
                        x: clientX,
                        y: clientY,
                    }),
                    data: { title: "", service: "" }, // Initialize with empty data
                    origin: [0.5, 0.0],
                    type: "actionNode",
                };

                setNodes((nds) => nds.concat(newNode));
                const fromNode = connectionState.fromNode;
                if (fromNode) {
                    setEdges((eds) =>
                        eds.concat({ id, source: fromNode.id, target: id })
                    );
                }
            }
        },
        [screenToFlowPosition]
    );

    function getOrderedNodes() {
        const startNode = nodes.find(
            (node) => !edges.some((edge) => edge.target === node.id)
        );

        if (!startNode) {
            console.error("No start node found");
            return [];
        }

        const orderedNodes = [];
        let currentNode = startNode;

        while (currentNode) {
            orderedNodes.push(currentNode);
            const nextEdge = edges.find(
                (edge) => edge.source === currentNode.id
            );
            if (
                !nextEdge ||
                !nodes.some((node) => node.id === nextEdge.target)
            ) {
                break;
            }
            const node = nodes.find((node) => node.id === nextEdge.target);
            if (!node) {
                break;
            }
            currentNode = node;
        }

        return orderedNodes;
    }

    const handleSave = async () => {
        const orderedNodes = getOrderedNodes();

        if (orderedNodes.length < 2) {
            setDialogData({
                title: "Failed to save flow",
                message: "Please connect at least two nodes",
                error: true,
            });
            return;
        }

        if (orderedNodes.length > 2) {
            if (user?.plan === 'free') {
                setDialogData({
                    title: "Failed to save flow",
                    message: "You can only have one reaction per flow on the free plan",
                    error: true,
                });
                return;
            }
            setDialogData({
                title: "Failed to save flow",
                message: "Multiple reactions are not supported yet, only the first reaction will be saved",
                error: true,
            });
        }

        const nodesData = orderedNodes.map((node) => node.data);

        const trigger = nodesData[0];
        const trigger_token = getServiceToken(trigger.service);

        if (!trigger_token || !getServiceToken(nodesData[1].service)) {
            setDialogData({
                title: "Failed to save flow",
                message: "Not logged in to all services",
                error: true,
            });
            return;
        }

        const special_triggers = ["email_sent", "email_received", "email_received_from_person", "calendar_event_created", "email_sent_to_person"]

        const data = {
            trigger: trigger.title,
            trigger_args: (() => {
                let args = [];
                const paramsArgs = trigger.params ? Object.values(trigger.params).map(value => String(value)) : [];
                if (!trigger.title) return
                if (special_triggers.includes(trigger.title)) {
                    args = ["area-epitech-437409", "Area-Epitech", ...paramsArgs];
                } else {
                    args = paramsArgs;
                }
                return args;
            })(),
            action_name: nodesData[1].title,
            action_params: nodesData[1].params ? Object.values(nodesData[1].params).map(value => String(value)) : [],
            params: {
                oauth_token: getServiceToken(trigger.service),
                service: trigger.service,
            },
            user_id: user?.id,
        };

        try {
            const res = await fetch(`${apiUrl}/tasks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                console.error("Failed to save flow");
                setDialogData({
                    title: "Failed to save flow",
                    message: "An error occurred while saving your flow",
                    error: true,
                });
                return;
            }
            setDialogData({
                title: "Flow saved",
                message: "Your flow has been saved successfully",
                error: false,
            });
        } catch (err) {
            console.error("Failed to save flow", err);
            setDialogData({
                title: "Failed to save flow",
                message: "An error occurred while saving your flow",
                error: true,
            });
        }
    };

    const onNodeClick = (event: React.MouseEvent, node: Node<NodeData>) => {
        setSelectedNode(node);
    };

    const handleFormSubmit = (data: NodeData) => {
        if (selectedNode) {
            setNodes((nds) =>
                nds.map((node) =>
                    node.id === selectedNode.id ? { ...node, data } : node
                )
            );
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col">
            <Card className="m-4">
                <CardHeader>
                    <div className="flex justify-between">
                        <div>
                            <CardTitle className="flex">Flow Editor</CardTitle>
                            <CardDescription className="flex">Create and edit your workflow</CardDescription>
                        </div>
                        {!isEditing && (
                            <div className="flex gap-3">
                                {!isEditing && user?.plan === 'free' && nbTasks >= 10 && (
                                    <>
                                        <div className="text-red-700 self-center">You have reached the maximum number of tasks for the free plan</div>
                                        <Link href="/pricing" passHref>
                                            <Button type="button">
                                                <ArrowUpCircle size={20} className="mr-2" />
                                                Upgrade Plan
                                            </Button>
                                        </Link>
                                    </>
                                )}
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button onClick={handleSave} className="ml-auto" disabled={!isEditing && user?.plan === 'free' && nbTasks >= 10}>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className={dialogData?.error ? 'text-red-700' : ''}>
                                                {dialogData?.title}
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>{dialogData?.message}</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Ok</AlertDialogCancel>
                                            {!dialogData?.error && (
                                                <AlertDialogAction onClick={() => router.push('/dashboard')}>
                                                    Dashboard
                                                </AlertDialogAction>
                                            )}
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <Sheet onOpenChange={setOpenSheet}>
                        <Card className="h-[calc(100vh-200px)]">
                            <ReactFlow
                                colorMode={theme as ColorMode}
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onConnect={onConnect}
                                onConnectEnd={onConnectEnd}
                                nodeTypes={nodeTypes}
                                onNodeClick={onNodeClick}
                            >
                                <Background />
                                <Controls />
                            </ReactFlow>
                        </Card>
                        <EditorSheet
                            selectedNode={selectedNode}
                            onSubmit={handleFormSubmit}
                            openSheet={openSheet}
                        />
                    </Sheet>
                </CardContent>
            </Card>
        </div>
    )
}

function EditorPageWithFlowProvider() {
    return (
        <ReactFlowProvider>
            <EditorPage />
        </ReactFlowProvider>
    );
}

export default withAuth(EditorPageWithFlowProvider);
