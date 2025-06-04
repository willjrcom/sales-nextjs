import { ColumnDef, Table, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from "@tanstack/react-table";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface BaseRow {
    id: string;
}

type RowSelectionType = "normal" | "checkbox" | "radio";

interface DataProps<T extends BaseRow> {
    columns: ColumnDef<T>[];
    data: T[];
    rowSelectionType?: RowSelectionType; // "normal", "checkbox", "radio"
    selectedRows?: Set<string>; // Opcional
    setSelectedRows?: Dispatch<SetStateAction<Set<string>>>; // Opcional
    selectedRow?: string | null; // Estado para seleção única (externo)
    setSelectedRow?: Dispatch<SetStateAction<string>>; // Setter para seleção única
    /**
     * Callback invoked when page or pageSize changes (zero-based pageIndex)
     */
    onPageChange?: (pagination: Pagination) => void;
    /**
     * Total count of items (for server-side pagination)
     */
    totalCount?: number;

    pagination: Pagination;
    setPagination: Dispatch<SetStateAction<Pagination>>;
}

const CrudTable = <T extends BaseRow,>({
    columns,
    data,
    rowSelectionType = "normal",
    selectedRows: externalSelectedRows,
    setSelectedRows: externalSetSelectedRows,
    selectedRow: externalSelectedRow,
    setSelectedRow: externalSetSelectedRow,
    totalCount,
    onPageChange,
    pagination,
    setPagination,
}: DataProps<T>) => {
    const [internalSelectedRows, setInternalSelectedRows] = useState<Set<string>>(new Set());
    const [internalSelectedRow, setInternalSelectedRow] = useState<string | null>(null);

    // Use o estado externo se disponível, caso contrário, use o interno
    const selectedRows = externalSelectedRows ?? internalSelectedRows;
    const setSelectedRows = externalSetSelectedRows ?? setInternalSelectedRows;

    const selectedRow = externalSelectedRow ?? internalSelectedRow;
    const setSelectedRow = externalSetSelectedRow ?? setInternalSelectedRow;

    const toggleRowSelection = (rowId: string) => {
        if (rowSelectionType === "checkbox") {
            setSelectedRows(prev => {
                const newSet = new Set(prev);
                if (newSet.has(rowId)) {
                    newSet.delete(rowId);
                } else {
                    newSet.add(rowId);
                }
                return newSet;
            });
        } else if (rowSelectionType === "radio") {
            setSelectedRow(rowId);
        }
    };

    const isRowSelected = (rowId: string) => selectedRows.has(rowId) || selectedRow === rowId;

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

    const isAllRowsSelected = () => selectedRows.size === table.getRowModel().rows.length && selectedRows.size > 0;

    const manualPagination = totalCount != undefined;

    useEffect(() => {
        if (manualPagination && onPageChange) {
            onPageChange(pagination);
        }
    }, [pagination.pageIndex, pagination.pageSize, manualPagination, onPageChange]);

    const pageCount = manualPagination
        ? Math.ceil(totalCount / pagination.pageSize)
        : Math.ceil(data.length / pagination.pageSize);

    const table = useReactTable({
        columns,
        data,
        getCoreRowModel: getCoreRowModel(),
        manualPagination,
        getPaginationRowModel: getPaginationRowModel(),
        pageCount,
        state: { pagination: pagination },
        onPaginationChange: (updater) => {
            const newState = typeof updater === 'function' ? updater(pagination) : updater;
            setPagination(newState);
            if (manualPagination && onPageChange) {
                onPageChange(newState);
            }
        },
    });

    return (
        <div>
            <div className="overflow-y-auto h-[50vh]">
                <table className="min-w-full divide-y divide-gray-200 bg-white shadow-md">
                    {tHead({ table, rowSelectionType, toggleAllRowsSelection, isAllRowsSelected })}
                    {tBody({ table, rowSelectionType, columns, toggleRowSelection, isRowSelected, manualPagination })}
                </table>
            </div>
            {Pagination({ table })}
        </div>
    );
};

interface THeadProps<T extends BaseRow> {
    table: Table<T>;
    rowSelectionType: RowSelectionType;
    toggleAllRowsSelection: () => void;
    isAllRowsSelected: () => boolean;
}

const tHead = <T extends BaseRow,>({ table, rowSelectionType, toggleAllRowsSelection, isAllRowsSelected }: THeadProps<T>) => {
    return (
        <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                    {rowSelectionType === "checkbox" && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input
                                type="checkbox"
                                className="form-checkbox"
                                checked={isAllRowsSelected()}
                                onChange={toggleAllRowsSelection}
                            />
                        </th>
                    )}
                    {rowSelectionType === "radio" && (
                        <th></th>
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
    columns: ColumnDef<T>[];
    toggleRowSelection: (rowId: string) => void;
    isRowSelected: (rowId: string) => boolean;
    rowSelectionType: RowSelectionType;
    manualPagination: boolean;
}

const tBody = <T extends BaseRow,>({ table, rowSelectionType, columns, toggleRowSelection, isRowSelected, manualPagination }: TBodyProps<T>) => {
    const { pageIndex, pageSize } = table.getState().pagination;
    const allRows = table.getRowModel().rows;
    const pagedRows = manualPagination ? allRows : allRows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

    if (pagedRows.length === 0) {
        return noResults({ columns });
    }
    return (
        <tbody className="bg-white divide-y divide-gray-200">
            {pagedRows.map(row => (
                <tr key={row.original.id} className="hover:bg-gray-100">
                    {rowSelectionType === "checkbox" && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <input
                                type="checkbox"
                                className="form-checkbox"
                                checked={isRowSelected(row.original.id)}
                                onChange={() => toggleRowSelection(row.original.id)}
                            />
                        </td>
                    )}
                    {rowSelectionType === "radio" && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input
                                type="radio"
                                className="form-radio"
                                checked={isRowSelected(row.original.id)}
                                onChange={() => toggleRowSelection(row.original.id)}
                            />
                        </th>
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
    columns: ColumnDef<any>[];
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
