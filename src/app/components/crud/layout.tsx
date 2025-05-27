const CrudLayout = ({
    title,
    plusButtonChildren,
    searchButtonChildren,
    filterButtonChildren,
    refreshButton,
    tableChildren,
}: Readonly<{
    title: React.ReactNode;
    plusButtonChildren?: React.ReactNode;
    searchButtonChildren?: React.ReactNode;
    filterButtonChildren?: React.ReactNode;
    refreshButton?: React.ReactNode;
    tableChildren: React.ReactNode;
}>) => {
    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="grid grid-cols-3 items-center mb-6">
                <div className="flex justify-start">
                    {searchButtonChildren}
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold">{title}</h1>
                </div>
                <div className="flex justify-end">
                    {refreshButton}
                </div>
            </div>
            {/* Optional add button (e.g., new item) */}
            {plusButtonChildren}
            {/* Divider */}
            <div className="border-b my-4" />
            {/* Optional filter or hint below divider */}
            {filterButtonChildren}
            {/* Content with horizontal scroll if needed */}
            <div className="overflow-x-auto">
                {tableChildren}
            </div>
        </div>
    );
};

export default CrudLayout