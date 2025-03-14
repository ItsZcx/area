import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

export default function PaginationComponent({ currentPage, totalPages, onPageChange }: PaginationProps) {
    return (
        <Pagination>
            <PaginationContent className="w-fit ml-auto">
                <PaginationItem>
                    <PaginationPrevious
                        role="button"
                        onClick={() => onPageChange(currentPage - 1)}
                        className={currentPage === 1 ? "opacity-50 cursor-default" : ""}
                    />
                </PaginationItem>
                <PaginationItem>
                    <PaginationNext
                        role="button"
                        onClick={() => onPageChange(currentPage + 1)}
                        className={currentPage === totalPages ? "opacity-50 cursor-default" : ""}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
