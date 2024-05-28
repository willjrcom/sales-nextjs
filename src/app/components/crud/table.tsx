import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";

const CrudTable = () => {
    const data = [
        {
            col1: 'Hello',
            col2: 'id',
            col3: 'id',
        },
        {
            col1: 'react-table',
            col2: 'name',
            col3: 'id',
        },
        {
            col1: 'whatever',
            col2: 'code',
            col3: 'id',
        },
    ];

    const columns = useMemo<ColumnDef<{ col1: string; col2: string, col3: string }>[]>(() => [
        {
            header: 'ID',
            accessorKey: 'col1',
        },
        {
            header: 'Name',
            accessorKey: 'col2',
        },
        {
            header: 'Code',
            accessorKey: 'col3',
        },
    ], []);


    const table = useReactTable({ columns, data, getCoreRowModel: getCoreRowModel(), });

    return (<table className="min-w-full divide-y divide-gray-200 bg-white shadow-md">
        <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map(column => (
                        <th
                            key={column.id}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            {flexRender(column.id, column.getContext())}
                        </th>
                    ))}
                </tr>
            ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-100">
                        {row.getVisibleCells().map(cell => (
                            <td
                                key={cell.id}
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={columns.length} className="h-24 text-center text-gray-500">
                        Sem resultados.
                    </td>
                </tr>
            )}
        </tbody>
    </table>
    )
}

export default CrudTable