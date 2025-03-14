'use client'

import { Node } from "@xyflow/react"
import { NodeData } from "../page"
import { z } from "zod"
import { useEffect, useState, forwardRef } from "react"
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { SheetFooter } from "@/components/ui/sheet"
import getFancyName from "@/lib/FancyNames";
import { useServiceToken } from '@/hooks/useServiceToken';

const apiUrl = process.env.NEXT_PUBLIC_API_URL

const formSchema = z.object({
    service: z.string().min(1),
    action: z.string().min(1)
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ForwardedSelect = forwardRef<HTMLDivElement, React.ComponentProps<typeof Select>>((props, ref) => {
    return <Select {...props} />
})
ForwardedSelect.displayName = 'ForwardedSelect'

interface NodeSetupProps {
    selectedNode: Node<NodeData> | null
    onSubmit: (data: { service: string; action: string }, shouldContinue: boolean) => void
}

export default function NodeSetup({ selectedNode, onSubmit }: NodeSetupProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            service: selectedNode?.data.service || "",
            action: selectedNode?.data.title || "",
        }
    });

    const [services, setServices] = useState<string[]>([]);
    const [actions, setActions] = useState<string[]>([]);
    const [isFormValid, setIsFormValid] = useState(form.formState.isValid);
    const [serviceToken, setServiceToken] = useState<string | null>(form.getValues('service'));

    const nodeType = selectedNode?.type === 'actionNode' ? 'reactions' : 'events';

    const { getServiceToken } = useServiceToken();

    useEffect(() => {
        if (form.getValues('service')) {
            setServiceToken(getServiceToken(form.getValues('service')));
        }
    }, [form.getValues('service')])

    useEffect(() => {
        const fetchServices = async () => {
            const url = `${apiUrl}/tasks/services/${nodeType}`;
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error("Failed to fetch services");
                }
                const data = await res.json();
                setServices(data);
            } catch (error) {
                console.error(error);
            }
        }
        fetchServices()
    }, [nodeType])

    useEffect(() => {
        async function fetchActions(service: string) {
            const url = `${apiUrl}/tasks/${nodeType}/${service}`;
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error("Failed to fetch actions");
                }
                const data = await res.json();
                setActions(data);
            } catch (error) {
                console.error(error);
            }
        }
        if (form.getValues('service') && serviceToken) {
            fetchActions(form.getValues('service'));
        }
    }, [form.getValues('service'), nodeType, serviceToken]);

    const onServiceChange = (value: string) => {
        setServiceToken(getServiceToken(value));
        setActions([]);
        form.setValue('service', value);
        form.setValue('action', '');
        setIsFormValid(false);
        handleSubmit();
    }

    const onActionChange = (value: string) => {
        form.setValue('action', value);
        setIsFormValid(true);
        handleSubmit();
    }

    const handleSubmit = form.handleSubmit((data) => {
        onSubmit(data, false);
    })

    function handleContinue(values: z.infer<typeof formSchema>) {
        onSubmit(values, true);
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleContinue)} className="space-y-5">
                    <FormField
                        control={form.control}
                        name="service"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Service</FormLabel>
                                <ForwardedSelect onValueChange={onServiceChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a service" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectGroup>
                                            {services.map((service) => (
                                                <SelectItem key={service} value={service}>
                                                    {getFancyName(service)}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </ForwardedSelect>
                            </FormItem>
                        )}
                    />

                    {form.getValues('service') && actions.length > 0 && (
                        <FormField
                            control={form.control}
                            name="action"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Action</FormLabel>
                                    <ForwardedSelect onValueChange={onActionChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an action" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectGroup>
                                                {actions.map((action) => (
                                                    <SelectItem key={action} value={action}>
                                                        {getFancyName(action)}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </ForwardedSelect>
                                </FormItem>
                            )}
                        />
                    )}
                    {form.getValues('service') && !serviceToken && actions.length === 0 && (
                        <div className="text-red-600">
                            Service not available, log in to use it
                        </div>
                    )}
                    <SheetFooter>
                        <Button
                            type="submit"
                            disabled={!isFormValid && !form.getValues('action')}
                            className="fixed bottom-7 right-5"
                        >
                            Continue
                        </Button>
                    </SheetFooter>
                </form>
            </Form>
        </div>
    )
}
