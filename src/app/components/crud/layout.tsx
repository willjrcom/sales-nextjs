const CrudLayout = ({
    title, plusButtonChildren, searchButtonChildren, filterButtonChildren, refreshButton, tableChildren
}: Readonly<{
    title: string
    plusButtonChildren?: React.ReactNode;
    searchButtonChildren?: React.ReactNode;
    filterButtonChildren: React.ReactNode;
    refreshButton?: React.ReactNode;
    tableChildren: React.ReactNode;

}>) => {

    return (<>
        <div className="flex items-center justify-between">
            {searchButtonChildren || <div className="w-1/6"></div>}
            <h1 className="text-2xl font-bold mb-4">{title}</h1>
            {refreshButton}
        </div>
        
        {filterButtonChildren}
        {plusButtonChildren}

        <hr className="my-4" />
        {tableChildren}
    </>);
}

export default CrudLayout