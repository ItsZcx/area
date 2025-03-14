import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Image from 'next/image';
import { useAppLogo } from "@/hooks/useAppLogos";
import { Template } from "@/lib/templates";
import Link from "next/link";

type TemplateCardProps = {
    template: Template;
};

export default function TemplateCard({ template }: TemplateCardProps) {

    const { getAppLogo } = useAppLogo();

    function onCardClick() {

    }

    return (
        <Link href={`/editor/${template.id}`} passHref>
            <Card
                className="flex flex-col justify-between transition-shadow hover:shadow-lg"
                role="button"
                tabIndex={0}
                onClick={onCardClick}
            >
                <CardHeader>
                    <CardTitle>{template.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Image src={getAppLogo(template.actionService)} alt={template.actionService} width={24} height={24} />
                                </TooltipTrigger>
                                <TooltipContent>{template.actionService}</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Image src={getAppLogo(template.reactionService)} alt={template.reactionService} width={24} height={24} />
                                </TooltipTrigger>
                                <TooltipContent>{template.reactionService}</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
