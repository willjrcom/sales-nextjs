import { createTable } from "@tanstack/react-table";


const CrudLayout = ({
    title, plusButtonChildren, filterButtonChildren, tableChildren
}: Readonly<{
    title: string
    plusButtonChildren: React.ReactNode;
    filterButtonChildren: React.ReactNode;
    tableChildren: React.ReactNode;

}>) => {
    return (<>
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <div className="flex items-center justify-between">
            {filterButtonChildren}
            {plusButtonChildren}
        </div>

        <hr className="my-4" />
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" className="px-6 py-3">
                        ID
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Name
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Email
                    </th>
                </tr>
            </thead>
        </table>
        {tableChildren}
    </>);
}

export default CrudLayout