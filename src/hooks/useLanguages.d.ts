export interface Language {
    id: string;
    name: string;
    nativeName?: string;
    code: string;
    isActive: boolean;
    sortOrder?: number;
    flag?: string;
}
interface UseLanguagesReturn {
    languages: Language[];
    languageNames: string[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}
export declare const useLanguages: () => UseLanguagesReturn;
export {};
