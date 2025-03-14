import { Card } from '@/components/ui/card';
import { SheetTrigger } from '@/components/ui/sheet';
import { useAppLogo } from '@/hooks/useAppLogos';
import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { NodeData } from '../page';
import { BotIcon } from 'lucide-react';
import getFancyName from '@/lib/FancyNames';

export default function TriggerNode({ data }: NodeProps<Node<NodeData>>) {
    const { getAppLogo } = useAppLogo();

    const { resolvedTheme } = useTheme();
    const themeClasses = resolvedTheme === 'dark' ?
        'bg-neutral-900 border-neutral-600 hover:shadow-md hover:shadow-neutral-800'
        :
        'bg-white border-neutral-900 hover:shadow-md';

    return (
        <SheetTrigger asChild>
            <div className={`p-4 w-80 border rounded ${themeClasses}`}>
                <Card className='p-2 flex space-x-2 w-fit'>
                {data.service ?
                        <Image src={getAppLogo(data.service)} alt={''} width={20} height={20} />
                        :
                        <BotIcon size={20} />
                    }
                    <p className='text-sm'>{getFancyName(data.service || 'Action')}</p>
                </Card>
                <p className={`mt-2 text-lg ${data.title ? '' : 'text-neutral-500'}`}>
                    {getFancyName(data.title || 'Select an event to trigger the flow')}
                </p>
                <Handle
                    id="a"
                    type="source"
                    position={Position.Bottom}
                    className='w-6 h-3 rounded-sm bg-teal-500'
                />
            </div>
        </SheetTrigger>
    );
}
