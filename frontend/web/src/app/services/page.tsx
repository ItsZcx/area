"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useUserServices } from "./hooks/useUserServices";
import ServiceList from "./components/ServiceList";
import withAuth from "@/lib/withAuth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const allServices: string[] = [
    'github',
    'google',
];

const ITEMS_PER_PAGE = 10;

function ServicesPage() {
    const [connectedPage, setConnectedPage] = useState(1);
    const [availablePage, setAvailablePage] = useState(1);

    const { services, loading, error } = useUserServices();

    const availableServices = allServices.filter(service => !services.includes(service));

    const totalConnectedPages = Math.ceil(services.length / ITEMS_PER_PAGE);
    const totalAvailablePages = Math.ceil(availableServices.length / ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    function handleConnect(service: string) {
        const url = `${apiUrl}/auth/${service}`;

        try {
            window.location.href = url;
        } catch (err) {
            console.error(err);
            alert(`An error occurred while trying to authenticate with ${service}.`);
        }
    }

    return (
        <div className="pb-20">
            <h2 className="text-3xl font-bold mb-12">Your Services</h2>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Connected Services</CardTitle>
                    <CardDescription>Services you already connected to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    {services.length === 0 ? (
                        <p className="text-gray-500">You have not connected any services yet</p>
                    ) : (
                        <ServiceList
                            services={services}
                            page={connectedPage}
                            totalPages={totalConnectedPages}
                            onPageChange={setConnectedPage}
                        />
                    )}
                </CardContent>
            </Card>

            <Separator className="my-8" />

            <Card>
                <CardHeader>
                    <CardTitle>Available Services</CardTitle>
                    <CardDescription>Services you can connect to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    {availableServices.length === 0 ? (
                        <p className="text-gray-500">You have connected all available services</p>
                    ) : (
                        <ServiceList
                            services={availableServices}
                            page={availablePage}
                            totalPages={totalAvailablePages}
                            onPageChange={setAvailablePage}
                            onConnect={handleConnect}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default withAuth(ServicesPage);
