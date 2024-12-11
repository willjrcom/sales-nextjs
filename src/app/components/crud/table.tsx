import { ColumnDef, Table, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from "@tanstack/react-table";
import { Dispatch, SetStateAction, useState } from "react";

interface BaseRow {
    id: string;
}

interface DataProps<T extends BaseRow> {
    columns: ColumnDef<T>[];
    data: T[];
    showCheckbox?: boolean; // Controla exibição dos checkboxes
    selectedRows?: Set<string>; // Opcional
    setSelectedRows?: Dispatch<SetStateAction<Set<string>>>; // Opcional
}

const CrudTable = <T extends BaseRow,>({
    columns,
    data,
    showCheckbox = false,
    selectedRows: externalSelectedRows,
    setSelectedRows: externalSetSelectedRows,
}: DataProps<T>) => {
    const [internalSelectedRows, setInternalSelectedRows] = useState<Set<string>>(new Set());

    // Use o estado externo se disponível, caso contrário, use o interno
    const selectedRows = externalSelectedRows ?? internalSelectedRows;
    const setSelectedRows = externalSetSelectedRows ?? setInternalSelectedRows;

    const [pageSize, setPageSize] = useState(10); // Tamanho da página
    const [pageIndex, setPageIndex] = useState(0); // Página atual

    const toggleRowSelection = (rowId: string) => {
        setSelectedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(rowId)) {
                newSet.delete(rowId);
            } else {
                newSet.add(rowId);
            }
            return newSet;
        });
    };

    const isRowSelected = (rowId: string) => selectedRows.has(rowId);

    const toggleAllRowsSelection = () => {
        setSelectedRows(prev => {
            if (prev.size === table.getRowModel().rows.length) {
                // Desmarca todos
                return new Set();
            } else {
                // Marca todos
                const allRowIds = new Set(table.getRowModel().rows.map(row => row.original.id));
                return allRowIds;
            }
        });
    };

    const isAllRowsSelected = () => selectedRows.size === table.getRowModel().rows.length;

    const table = useReactTable({
        columns,
        data,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(), // Habilita paginação
        state: {
            pagination: { pageIndex, pageSize },
        },
        onPaginationChange: (updater) => {
            const newState = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
            setPageIndex(newState.pageIndex);
            setPageSize(newState.pageSize);
        },
    });

    return (
        <div>
            <div className="overflow-y-auto h-[50vh]">
                <table className="min-w-full divide-y divide-gray-200 bg-white shadow-md">
                    {tHead({ table, showCheckbox, toggleAllRowsSelection, isAllRowsSelected })}
                    {tBody({ table, columns, toggleRowSelection, isRowSelected, showCheckbox })}
                </table>
            </div>
            {Pagination({ table })}
        </div>
    );
};

interface THeadProps<T extends BaseRow> {
    table: Table<T>;
    showCheckbox: boolean;
    toggleAllRowsSelection: () => void;
    isAllRowsSelected: () => boolean;
}

const tHead = <T extends BaseRow,>({ table, showCheckbox, toggleAllRowsSelection, isAllRowsSelected }: THeadProps<T>) => {
    return (
        <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                    {showCheckbox && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input
                                type="checkbox"
                                className="form-checkbox"
                                checked={isAllRowsSelected()}
                                onChange={toggleAllRowsSelection}
                            />
                        </th>
                    )}
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
    );
};


interface TBodyProps<T extends BaseRow> {
    table: Table<T>;
    columns: any[];
    toggleRowSelection: (rowId: string) => void;
    isRowSelected: (rowId: string) => boolean;
    showCheckbox: boolean;
}

const tBody = <T extends BaseRow,>({ table, columns, toggleRowSelection, isRowSelected, showCheckbox }: TBodyProps<T>) => {
    if (table.getRowModel().rows.length === 0) {
        return noResults({ columns });
    }

    return (
        <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
                <tr key={row.original.id} className="hover:bg-gray-100">
                    {showCheckbox && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <input
                                type="checkbox"
                                className="form-checkbox"
                                checked={isRowSelected(row.original.id)}
                                onChange={() => toggleRowSelection(row.original.id)}
                            />
                        </td>
                    )}
                    {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    );
};

interface noResultsProps {
    columns: any[];
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
    );
};

interface PaginationProps<T> {
    table: Table<T>;
}

const Pagination = <T,>({ table }: PaginationProps<T>) => {
    const { pageIndex, pageSize } = table.getState().pagination;

    return (
        <div className="flex items-center justify-between mt-4">
            <div className="flex items-center justify-center gap-4 flex-1">
                <button
                    className="px-4 py-2 bg-gray-200 rounded-md"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    {'<'} Anterior
                </button>
                <span>
                    Página <strong>{pageIndex + 1}</strong> de {table.getPageCount()}
                </span>
                <button
                    className="px-4 py-2 bg-gray-200 rounded-md"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Próximo {'>'}
                </button>
            </div>

            <div className="ml-auto">
                <select
                    className="p-2 bg-gray-200 rounded-md"
                    value={pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                >
                    {[10, 20, 30, 40, 50].map(size => (
                        <option key={size} value={size}>
                            Exibir {size}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default CrudTable;
