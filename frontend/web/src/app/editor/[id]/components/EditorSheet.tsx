import { SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { NodeData } from "../page";
import { Node } from "@xyflow/react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useEffect, useState } from "react";
import NodeSetup from "./NodeSetup";
import NodeConfigure from "./NodeConfigure";

interface EditorSheetProps {
    selectedNode: Node<NodeData> | null;
    onSubmit: (data: NodeData) => void;
    openSheet: boolean;
}

export default function EditorSheet({ selectedNode, onSubmit, openSheet }: EditorSheetProps) {

    const [selectedTab, setSelectedTab] = useState<'setup' | 'configure'>('setup');

    function handleSetupSubmit(data: { service: string; action: string }, shouldContinue: boolean) {
        if (selectedNode) {
            selectedNode.data.service = data.service;
            selectedNode.data.title = data.action;
            onSubmit(selectedNode?.data);
            if (shouldContinue) {
                setSelectedTab('configure');
            }
        }
    }

    useEffect(() => {
        if (openSheet) {
            setSelectedTab('setup');
        }
    }, [openSheet]);

    return (
        <SheetContent>
            <SheetHeader className="mb-4">
                <SheetTitle>Editor</SheetTitle>
                <SheetDescription>Build your automation flow</SheetDescription>
            </SheetHeader>

            <Breadcrumb className="mb-5">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink
                            onClick={() => { setSelectedTab('setup') }}
                            className={`cursor-pointer ${selectedTab === 'setup' ? 'font-bold' : ''}`}
                        >
                            Setup
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink
                            onClick={() => { setSelectedTab('configure') }}
                            className={`cursor-pointer ${selectedTab === 'configure' ? 'font-bold' : ''}`}
                        >
                            Configure
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {selectedTab === 'setup' &&
                <NodeSetup selectedNode={selectedNode} onSubmit={handleSetupSubmit} />
            }

            {selectedTab === 'configure' &&
                <NodeConfigure selectedNode={selectedNode} onSubmit={onSubmit} />
            }
        </SheetContent>
    );
}
