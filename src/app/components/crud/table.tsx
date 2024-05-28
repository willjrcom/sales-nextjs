import GetProducts from "@/app/api/product/route";
import { Product } from "@/app/entities/product/product";
import ProductColumns from "@/app/entities/product/table-columns";
import { Table, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

const CrudTable = () => {
    const [data, setData] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const products = await GetProducts();
                console.log(products.length)
                setData(products);
            } catch (err) {
                console.log("errorrrr")
                console.log(err)
                setError((err as Error).message);
            } finally {
                console.log("finally")
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const columns = useMemo(() => ProductColumns(), []);

    const table = useReactTable({
        columns,
        data,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
    <table className="min-w-full divide-y divide-gray-200 bg-white shadow-md">
        {tHead({ table })}
        {tBody({ table, columns })}
    </table>
    )
}

interface THeadProps<T> {
    table: Table<T>;
}

const tHead = <T,>({ table }: THeadProps<T>) => {
    return(
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
    return(
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
    )
}

export default CrudTable