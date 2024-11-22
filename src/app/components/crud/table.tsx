import { ColumnDef, Table, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

interface DataProps<T> {
    columns: ColumnDef<T>[];
    data: T[];
}

const CrudTable = <T,>({ columns, data }: DataProps<T>) => {
    const table = useReactTable({
        columns,
        data,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="overflow-y-auto h-[80vh]">
            <table className="min-w-full divide-y divide-gray-200 bg-white shadow-md">
                {tHead({ table })}
                {tBody({ table, columns })}
            </table>
        </div>
    )
}

interface THeadProps<T> {
    table: Table<T>;
}

const tHead = <T,>({ table }: THeadProps<T>) => {
    return (
        <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map(column => (
                        <th
                            key={column.id}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            {flexRender(column.column.columnDef.header, column.getContext())}
                        </th>
                    ))}
                </tr>
            ))}
        </thead>
    )
}

interface TBodyProps<T> {
    table: Table<T>;
    columns: any[]
}

const tBody = <T,>({ table, columns }: TBodyProps<T>) => {
    if (table.getRowModel().rows.length === 0) {
        return noResults({ columns })
    }

    return (
        <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-100">
                    {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                ))}
            </tr>
        ))}
    </tbody>
)
}

interface noResultsProps {
columns: any[]
}

const noResults = ({ columns }: noResultsProps) => {
return (
    <tbody className="bg-white divide-y divide-gray-200">
        <tr>
            <td colSpan={columns.length} className="h-24 text-center text-gray-500">
                Sem resultados.
            </td>
        </tr>
    </tbody>
)
}

export default CrudTable
