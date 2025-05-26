import { useState, useMemo } from 'react'

interface DataTableProps {
    data: any[]
    columns: Array<{
        field: string
        header: string
        render?: (item: any) => React.ReactNode
    }>
    onEdit?: (item: any) => void
    onDelete?: (id: string) => void
    showActions?: boolean
    showSearch?: boolean
}

function DataTable({ data, columns, onEdit, onDelete, showActions = true, showSearch = false }: DataTableProps) {
    const [sortField, setSortField] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const [filterValue, setFilterValue] = useState('')

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    const filteredData = useMemo(() => {
        if (!showSearch || !filterValue) return data
        
        return data.filter((item) => {
            return Object.values(item)
                .join(' ')
                .toLowerCase()
                .includes(filterValue.toLowerCase())
        })
    }, [data, filterValue, showSearch])

    const sortedData = useMemo(() => {
        if (!sortField) return filteredData

        return [...filteredData].sort((a, b) => {
            if (a[sortField] < b[sortField]) {
                return sortDirection === 'asc' ? -1 : 1
            }
            if (a[sortField] > b[sortField]) {
                return sortDirection === 'asc' ? 1 : -1
            }
            return 0
        })
    }, [filteredData, sortField, sortDirection])

    return (
        <div className='w-full'>
            {showSearch && (
                <div className='mb-4'>
                    <input
                        type='text'
                        placeholder='Search...'
                        className='form-input'
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                    />
                </div>
            )}

            <div className='overflow-x-auto rounded-lg shadow'>
                <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.field}
                                    onClick={() => handleSort(column.field)}
                                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                                >
                                    {column.header}
                                    {sortField === column.field && (
                                        <span className='ml-1'>
                                            {sortDirection === 'asc'
                                                ? '↑'
                                                : '↓'}
                                        </span>
                                    )}
                                </th>
                            ))}
                            {showActions && (onEdit || onDelete) && (
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                        {sortedData.map((row, rowIndex) => (
                            <tr key={rowIndex} className='hover:bg-gray-50'>
                                {columns.map((column) => (
                                    <td
                                        key={column.field}
                                        className='px-6 py-4 whitespace-nowrap'
                                    >
                                        {column.render
                                            ? column.render(row)
                                            : row[column.field]}
                                    </td>
                                ))}
                                {showActions && (onEdit || onDelete) && (
                                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                                        {onEdit && (
                                            <button
                                                onClick={() => onEdit(row)}
                                                className='text-indigo-600 hover:text-indigo-900 mr-2'
                                            >
                                                Edit
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                onClick={() => onDelete(row.id)}
                                                className='text-red-600 hover:text-red-900'
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                        {sortedData.length === 0 && (
                            <tr>
                                <td
                                    colSpan={columns.length + (showActions && (onEdit || onDelete) ? 1 : 0)}
                                    className='px-6 py-4 text-center text-gray-500'
                                >
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default DataTable
