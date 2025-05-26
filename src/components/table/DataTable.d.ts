interface DataTableProps {
    data: any[];
    columns: Array<{
        field: string;
        header: string;
        render?: (item: any) => React.ReactNode;
    }>;
    onEdit?: (item: any) => void;
    onDelete?: (id: string) => void;
    showActions?: boolean;
    showSearch?: boolean;
}
declare function DataTable({ data, columns, onEdit, onDelete, showActions, showSearch }: DataTableProps): import("react/jsx-runtime").JSX.Element;
export default DataTable;
