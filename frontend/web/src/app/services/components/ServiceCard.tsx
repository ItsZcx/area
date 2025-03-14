import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import getFancyName from '@/lib/FancyNames';
import { useAppLogo } from '@/hooks/useAppLogos';

interface ServiceCardProps {
    service: string;
    onConnect?: (service: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onConnect }) => {
    const { getAppLogo } = useAppLogo();

    return (
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 relative mb-2">
                <Image
                    src={getAppLogo(service)}
                    alt={`${service} logo`}
                    layout="fill"
                    objectFit="contain"
                />
            </div>
            <span className="text-sm font-medium mb-2">{getFancyName(service)}</span>
            {onConnect && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onConnect(service)}
                >
                    Connect
                </Button>
            )}
        </div>
    );
};

export default ServiceCard;
