import { useModal } from "@/app/context/modal/context";

export default function PageListProducts() {
    const modalHandler = useModal();

    return (
        <div className="flex min-h-screen bg-gray-200 p-4">
            {/* Coluna da Esquerda */}
            <div className="flex-1 bg-gray-300 p-4 space-y-6">
                <h1 className="text-2xl font-bold">Produtos</h1>

                {/* Categoria 1 */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <button className="text-2xl font-bold">{'<'}</button>
                        <span className="text-lg font-semibold">categoria 1</span>
                        <button className="text-2xl font-bold">{'>'}</button>
                    </div>
                    <div className="flex space-x-4 overflow-x-auto">
                        <div className="p-4 bg-white rounded shadow-md text-center border">
                            <div className="bg-green-500 h-20 rounded mb-2">foto</div>
                            <div>item 1</div>
                            <div>preço</div>
                        </div>
                        <div className="p-4 bg-white rounded shadow-md text-center border border-purple-500">
                            <div className="bg-green-500 h-20 rounded mb-2">foto</div>
                            <div>item 1</div>
                            <div>preço</div>
                        </div>
                    </div>
                </div>

                {/* Categoria 2 */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <button className="text-2xl font-bold">{'<'}</button>
                        <span className="text-lg font-semibold">categoria 2</span>
                        <button className="text-2xl font-bold">{'>'}</button>
                    </div>
                    <div className="flex space-x-4 overflow-x-auto">
                        <div className="p-4 bg-white rounded shadow-md text-center border">
                            <div className="bg-green-500 h-20 rounded mb-2">foto</div>
                            <div>item 1</div>
                            <div>preço</div>
                        </div>
                        <div className="p-4 bg-white rounded shadow-md text-center border">
                            <div className="bg-green-500 h-20 rounded mb-2">foto</div>
                            <div>item 1</div>
                            <div>preço</div>
                        </div>
                    </div>
                </div>

                {/* Categoria 3 */}
                <div className="space-y-2">
                    <span className="text-lg font-semibold">categoria 3</span>
                </div>
            </div>

            {/* Coluna da Direita */}
            <div className="w-80 bg-gray-100 p-4 space-y-4">
                <h2 className="text-xl font-semibold">Produto selecionado</h2>

                {/* Produto selecionado */}
                <div className="space-y-2">
                    <div className="bg-white p-4 rounded shadow">
                        <p>0.5 x item 1</p>
                        <p className="font-bold">R$ 8,00</p>
                    </div>

                    <div className="bg-white p-4 rounded shadow">
                        <p>0.5 x item 2</p>
                        <p className="font-bold">R$ 14,00</p>
                        <ul className="text-sm pl-4 list-disc">
                            <li>produto</li>
                            <li>1 x mussarela - R$ 2,00</li>
                            <li>2 x presunto - R$ 4,00</li>
                        </ul>
                    </div>

                    <div className="bg-white p-4 rounded shadow">
                        <p>Produto complemento</p>
                        <p className="font-bold">1 x item 3</p>
                        <p className="font-bold">R$ 8,00</p>
                    </div>
                </div>

                {/* Total e botão */}
                <div>
                    <p className="text-xl font-bold">Total: R$ 30,00</p>
                    <button className="w-full bg-green-500 text-white py-2 rounded mt-2" onClick={() => modalHandler.hideModal("list-products")}>
                        Adicionar item
                    </button>
                    <button className="w-full bg-green-500 text-white py-2 rounded mt-2" onClick={() => modalHandler.hideModal("list-products")}>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
