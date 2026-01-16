import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@application/contexts/LanguageContext';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, total, limit, onPageChange }: PaginationProps) => {
    const { t } = useLanguage();

    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, total);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const showPages = 5;

        if (totalPages <= showPages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) {
                end = 4;
            } else if (currentPage >= totalPages - 2) {
                start = totalPages - 3;
            }

            if (start > 2) {
                pages.push('...');
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages - 1) {
                pages.push('...');
            }

            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-700">
                {t.pagination?.showing || 'Showing'}{' '}
                <span className="font-medium">{startItem}</span>
                {' '}{t.pagination?.to || 'to'}{' '}
                <span className="font-medium">{endItem}</span>
                {' '}{t.pagination?.of || 'of'}{' '}
                <span className="font-medium">{total}</span>
                {' '}{t.pagination?.results || 'results'}
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                    aria-label="Previous page"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="flex gap-1">
                    {getPageNumbers().map((page, index) => {
                        if (page === '...') {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="px-3 py-1 text-gray-500"
                                >
                                    ...
                                </span>
                            );
                        }

                        return (
                            <button
                                key={page}
                                onClick={() => onPageChange(page as number)}
                                className={`pagination-number ${page === currentPage ? 'active' : ''
                                    }`}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                    aria-label="Next page"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};
