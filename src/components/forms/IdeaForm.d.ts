import { z } from 'zod';
import type { Idea } from '../../types/idea';
declare const formSchema: z.ZodObject<{
    title: z.ZodString;
    category: z.ZodString;
    type: z.ZodEnum<["Product", "Service"]>;
    problemDescription: z.ZodString;
    solutionDescription: z.ZodString;
    protectionStatus: z.ZodString;
    requireNDA: z.ZodBoolean;
    desiredPrice: z.ZodNumber;
    contactPreference: z.ZodString;
    additionalNotes: z.ZodOptional<z.ZodString>;
    photos: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "Product" | "Service";
    title: string;
    category: string;
    requireNDA: boolean;
    desiredPrice: number;
    problemDescription: string;
    solutionDescription: string;
    protectionStatus: string;
    contactPreference: string;
    additionalNotes?: string | undefined;
    photos?: string[] | undefined;
}, {
    type: "Product" | "Service";
    title: string;
    category: string;
    requireNDA: boolean;
    desiredPrice: number;
    problemDescription: string;
    solutionDescription: string;
    protectionStatus: string;
    contactPreference: string;
    additionalNotes?: string | undefined;
    photos?: string[] | undefined;
}>;
export type IdeaFormData = z.infer<typeof formSchema>;
interface IdeaFormProps {
    mode: 'create' | 'edit';
    initialData?: Partial<Idea>;
    onSubmit: (data: IdeaFormData, files: File[]) => Promise<void>;
    isSubmitting: boolean;
    submitError: string | null;
    onCancel?: () => void;
}
export default function IdeaForm({ mode, initialData, onSubmit, isSubmitting, submitError, onCancel, }: IdeaFormProps): import("react/jsx-runtime").JSX.Element;
export {};
