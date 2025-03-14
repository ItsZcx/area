import React from 'react';
import ServiceCard from './ServiceCard';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

interface ServiceListProps {
    services: string[];
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onConnect?: (service: string) => void;
}

const ITEMS_PER_PAGE = 10;

const paginateServices = (items: string[], page: number) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
};

const ServiceList: React.FC<ServiceListProps> = ({ services, page, totalPages, onPageChange, onConnect }) => {
    const paginatedServices = paginateServices(services, page);

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {paginatedServices.map((service) => (
                    <ServiceCard key={service} service={service} onConnect={onConnect} />
                ))}
            </div>
            {totalPages > 1 && (
                <Pagination className="mt-4">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                role="button"
                                onClick={() => onPageChange(Math.max(page - 1, 1))}
                                className={page === 1 ? "opacity-50 cursor-default" : ""}
                            />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <PaginationItem key={pageNum}>
                                <PaginationLink
                                    role="button"
                                    onClick={() => onPageChange(pageNum)}
                                    isActive={pageNum === page}
                                >
                                    {pageNum}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                role="button"
                                onClick={() => onPageChange(Math.min(page + 1, totalPages))}
                                className={page === totalPages ? "opacity-50 cursor-default" : ""}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </>
    );
};

export default ServiceList;
