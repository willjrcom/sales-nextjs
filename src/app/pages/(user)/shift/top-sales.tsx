import Image from "next/image";

const TopSales = () => {
    const topSales = [
        { id: 1, name: 'Hotdog Especial', quantity: 1543, grossValue: 'R$ 32.219,95', netValue: 'R$ 8.123,42', profit: '12%' },
        { id: 2, name: 'Hotdog Especial', quantity: 1543, grossValue: 'R$ 32.219,95', netValue: 'R$ 8.123,42', profit: '12%' },
        { id: 3, name: 'Hotdog Especial', quantity: 1543, grossValue: 'R$ 32.219,95', netValue: 'R$ 8.123,42', profit: '12%' },
    ];

    return (
        <div className="bg-white p-4 shadow-md rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Top de Vendas</h3>
            <table className="w-full text-left">
                <thead>
                    <tr>
                        <th className="pb-2">Produto</th>
                        <th className="pb-2">Pedidos</th>
                        <th className="pb-2">Valor Bruto</th>
                        <th className="pb-2">Valor Líquido</th>
                        <th className="pb-2">Lucro</th>
                    </tr>
                </thead>
                <tbody>
                    {topSales.map((sale) => (
                        <tr key={sale.id} className="border-t">
                            <td className="py-2 flex items-center">
                                <Image src="/img_login.jpg" alt={sale.name} width={40} height={40} className="rounded-full mr-4" />
                                {sale.name}
                            </td>
                            <td className="py-2">{sale.quantity}</td>
                            <td className="py-2">{sale.grossValue}</td>
                            <td className="py-2">{sale.netValue}</td>
                            <td className="py-2 text-green-500">{sale.profit}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default TopSales