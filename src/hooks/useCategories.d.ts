export interface Category {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    sortOrder?: number;
    icon?: string;
    color?: string;
}
interface UseCategoriesReturn {
    categories: Category[];
    categoryNames: string[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}
export declare const useCategories: () => UseCategoriesReturn;
export {};
