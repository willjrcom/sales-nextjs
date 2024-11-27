import { useModal } from "@/app/context/modal/context";
import { useCategories } from "@/app/context/category/context";
import CarouselProducts from "./carousel";
import ItemCard from "./card-item";
import { useGroupItem} from "@/app/context/group-item/context";

export default function ListProducts() {
    return (
        <div className="flex h-[70vh] bg-gray-200 p-4 overflow-hidden">
            <LeftComponent />
            <RightComponent />
        </div >
    );
}

const LeftComponent = () => {
    const contextCategory = useCategories();

    return (
        <div className="flex-1 p-4 bg-gray-100 space-y-6 mr-4 overflow-y-auto">
            <h1 className="text-2xl font-bold">Produtos</h1>
            <div>
                {contextCategory.items.map((category) => {
                    if (!category.products) return;
                    return (
                        <div key={category.id} className="mb-6">
                            <hr className="mb-2" />
                            <span className="text-lg font-semibold">{category.name}</span>
                            <CarouselProducts products={category.products} />
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

const RightComponent = () => {
    const modalHandler = useModal();
    const contextGroupItem = useGroupItem();

    return (
        < div className="w-80 bg-gray-100 p-4 space-y-4 overflow-y-auto" >
            <h2 className="text-xl font-semibold">Produtos selecionados</h2>

            {/* Produto Selecionado */}
            <div className="space-y-2">
                {contextGroupItem.groupItem?.items.map((item, index) => (
                    <ItemCard item={item}/>
                ))}
                
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

            {/* Total e Botão */}
            <div>
                <p className="text-xl font-bold">Total: R$ 30,00</p>
                <button
                    className="w-full bg-green-500 text-white py-2 rounded mt-2"
                    onClick={() => modalHandler.hideModal("list-products")}
                >
                    Adicionar item
                </button>
            </div>
        </div >
    )
}