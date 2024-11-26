import { useModal } from "@/app/context/modal/context";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import Product from "@/app/entities/product/product";
import { useCategories } from "@/app/context/category/context";

interface CarouselProductsProps {
    products: Product[];
}

const CarouselProducts = ({ products }: CarouselProductsProps) => {
    const swiper = useSwiper();

    return (
        <Swiper
            modules={[Navigation, Pagination, A11y]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={30}
            slidesPerView={3}
            onSlideChange={() => console.log('slide change')}
            onSwiper={(swiper) => console.log(swiper)}
        >
            <button onClick={() => swiper.slidePrev()}>Prev</button>
            {products.map((product) => (
                <SwiperSlide key={product.id}>
                    <div className="p-4 bg-white rounded shadow-md text-center border">
                        <div className="bg-green-500 h-20 rounded mb-2">foto</div>
                        <div>{product.name}</div>
                        <div>R$ {product.price}</div>
                        <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Adicionar</button>
                    </div>
                </SwiperSlide>
            ))}
            <button onClick={() => swiper.slideNext()}>Next</button>
        </Swiper>
    )
};

export default function ListProducts() {
    const modalHandler = useModal();
    const contextCategory = useCategories();

    return (
        <div className="flex h-[70vh] bg-gray-200 p-4 overflow-hidden">
            {/* Coluna Esquerda */}
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

            {/* Coluna da Direita */}
            <div className="w-80 bg-gray-100 p-4 space-y-4 overflow-y-auto">
                <h2 className="text-xl font-semibold">Produto selecionado</h2>

                {/* Produto Selecionado */}
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

                {/* Total e Botão */}
                <div>
                    <p className="text-xl font-bold">Total: R$ 30,00</p>
                    <button
                        className="w-full bg-green-500 text-white py-2 rounded mt-2"
                        onClick={() => modalHandler.hideModal("list-products")}
                    >
                        Adicionar item
                    </button>
                    <button
                        className="w-full bg-gray-300 text-black py-2 rounded mt-2"
                        onClick={() => modalHandler.hideModal("list-products")}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
