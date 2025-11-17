const CrudLayout = ({
    title,
    searchButtonChildren,
    refreshButton,
    tableChildren,
}: Readonly<{
    title: React.ReactNode;
    searchButtonChildren?: React.ReactNode;
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
            
            {/* Divider */}
            <div className="border-b my-4" />

            {/* Content with horizontal scroll if needed */}
            <div className="overflow-x-auto">
                {tableChildren}
            </div>
        </div>
    );
};

export default CrudLayout