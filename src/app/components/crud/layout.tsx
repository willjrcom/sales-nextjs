const CrudLayout = ({
    title, plusButtonChildren, filterButtonChildren, refreshButton, tableChildren
}: Readonly<{
    title: string
    plusButtonChildren: React.ReactNode;
    filterButtonChildren: React.ReactNode;
    refreshButton?: React.ReactNode;
    tableChildren: React.ReactNode;

}>) => {

    return (<>
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold mb-4">{title}</h1>
            {refreshButton}
        </div>
        
        <div className="flex items-center justify-between">
            {filterButtonChildren}
            {plusButtonChildren}
        </div>

        <hr className="my-4" />
        {tableChildren}
    </>);
}

export default CrudLayout