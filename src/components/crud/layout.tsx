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
        {tableChildren}
    </>);
}

export default CrudLayout