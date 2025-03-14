'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { NodeData as OriginalNodeData } from "../page"
import { Node } from "@xyflow/react"
import { useEffect, useState } from "react"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { SheetClose, SheetFooter } from "@/components/ui/sheet"
import ParamInputRenderer from "./ParamInputRenderer"
import { Loader2 } from "lucide-react"

interface NodeData extends OriginalNodeData {
    params?: {
        [key: string]: string
    }
}

interface Param {
    id: string;
    type: 'text' | 'textarea' | 'number' | 'switch' | 'date';
    label: string;
    placeholder: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL

const generateSchema = (params: Param[]) => {
    const fields: { [key: string]: z.ZodTypeAny } = {};
    params.forEach(param => {

        switch (param.type) {
            case 'text':
                fields[param.id] = z.string().min(1, `${param.label} is required`);
                break;
            case 'textarea':
                fields[param.id] = z.string().min(1, `${param.label} is required`);
                break;
            case 'number':
                fields[param.id] = z.coerce.number();
                break;
            case 'switch':
                fields[param.id] = z.boolean();
                break;
            case 'date':
                fields[param.id] = z.date();
                break;
            default:
                fields[param.id] = z.string().min(1, `${param.label} is required`);
        }
    });
    return z.object(fields);
};

interface NodeConfigureProps {
    selectedNode: Node<NodeData> | null
    onSubmit: (data: NodeData) => void
}

export default function NodeConfigure({ selectedNode, onSubmit }: NodeConfigureProps) {
    const [params, setParams] = useState<Param[]>([]);
    const [loading, setLoading] = useState(true);

    const formSchema = generateSchema(params);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {},
    });

    useEffect(() => {
        const fetchParams = async () => {
            if (!selectedNode || !selectedNode.data.title) {
                return
            }
            const type = selectedNode.type === 'actionNode' ? 'reaction' : 'event';
            const url = `${apiUrl}/tasks/params/${type}/${selectedNode.data.title}`;
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error('Failed to fetch params');
                }
                const data: Param[] = await res.json();
                setParams(data);

                const defaultValues = data.reduce((acc: Record<string, string>, param: Param) => {
                    acc[param.id] = selectedNode.data.params?.[param.id] || ""
                    return acc
                }, {});
                form.reset(defaultValues);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchParams();
    }, [selectedNode, form])

    if (!selectedNode) {
        return null;
    }

    function handleSubmit(data: z.infer<typeof formSchema>) {
        if (selectedNode) {
            onSubmit({
                ...selectedNode.data,
                params: data
            });
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                {params.map((param) => (
                    <ParamInputRenderer
                        key={param.id}
                        control={form.control}
                        name={param.id}
                        type={param.type}
                        label={param.label}
                        placeholder={param.placeholder}
                    />
                ))}
                { params.length === 0 && (
                    <p className="text-center text-gray-500">No parameters to configure</p>
                ) }
                <SheetFooter>
                    <SheetClose asChild>
                        <Button
                            type="submit"
                            disabled={!form.formState.isValid && params.length > 0}
                            className="fixed bottom-7 right-5"
                        >
                            Done
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </form>
        </Form>
    )
}
