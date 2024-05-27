const CrudLayout = ({
    title, children,
}: Readonly<{
    title: string
    children: React.ReactNode;

}>) => {
    return (<>
        <h1>{title}</h1>
        {children}
    </>);
}

export default CrudLayout