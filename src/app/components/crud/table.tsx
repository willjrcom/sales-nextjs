"use client";
import { ColumnDef, Table, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from "@tanstack/react-table";
import { Dispatch, SetStateAction, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface BaseRow {
    id: string;
}

type RowSelectionType = "normal" | "checkbox" | "radio";

interface DataProps<T extends BaseRow> {
    columns: ColumnDef<T>[];
    data: T[];
    rowSelectionType?: RowSelectionType;
    selectedRows?: Set<string>;
    setSelectedRows?: Dispatch<SetStateAction<Set<string>>>;
    selectedRow?: string | null;
    setSelectedRow?: Dispatch<SetStateAction<string>>;
    /**
     * Total count of items for server-side pagination.
     */
    totalCount?: number;
    /**
     * Callback invoked when server-side pagination changes.
     * Receives new pageIndex and pageSize.
     */
    onPageChange?: (pageIndex: number, pageSize: number) => void;
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
}: DataProps<T>) => {
    const [internalSelectedRows, setInternalSelectedRows] = useState<Set<string>>(new Set());
    const [internalSelectedRow, setInternalSelectedRow] = useState<string | null>(null);
    // Pagination state for server-side
    const [pageSize, setPageSize] = useState(10);
    const [pageIndex, setPageIndex] = useState(0);

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

    const hasTotalCount = totalCount != null && totalCount > 0;
    const pageCount = hasTotalCount ? Math.ceil(totalCount! / pageSize) : Math.ceil(data.length / pageSize);

    const table = useReactTable({
        columns,
        data,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: hasTotalCount,
        getPaginationRowModel: getPaginationRowModel(),
        pageCount,
        state: { pagination: { pageIndex, pageSize } },
        onPaginationChange: updater => {
            const newState = typeof updater === 'function'
                ? updater({ pageIndex, pageSize })
                : updater;
            setPageIndex(newState.pageIndex);
            setPageSize(newState.pageSize);
            if (hasTotalCount && onPageChange) {
                onPageChange(newState.pageIndex, newState.pageSize);
            }
        },
    });

    return (
        <div>
            <div className="overflow-y-auto h-[50vh]">
                <table className="min-w-full divide-y divide-gray-200 bg-white shadow-md">
                    {tHead({ table, rowSelectionType, toggleAllRowsSelection, isAllRowsSelected })}
                    {tBody({ table, rowSelectionType, columns, toggleRowSelection, isRowSelected })}
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
}

const tBody = <T extends BaseRow,>({ table, rowSelectionType, columns, toggleRowSelection, isRowSelected }: TBodyProps<T>) => {
    const rows = table.getRowModel().rows;

    if (rows.length === 0) {
        return noResults({ columns });
    }
    return (
        <tbody className="bg-white divide-y divide-gray-200">
            {rows.map(row => (
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
            <div className="flex items-center gap-2">
                <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FiChevronLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                    Anterior
                </button>
                <span className="text-sm text-gray-700">
                    Página <strong className="font-medium">{pageIndex + 1}</strong> de <strong className="font-medium">{table.getPageCount()}</strong>
                </span>
                <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Próximo
                    <FiChevronRight className="h-4 w-4 ml-2" aria-hidden="true" />
                </button>
            </div>
            <div>
                <select
                    value={pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 bg-white text-sm rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {[2, 10, 20, 30, 40, 50].map(size => (
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
