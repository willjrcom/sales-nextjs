import Product from "@/app/entities/product/product";
import Image from "next/image";
import AddProductCard from "@/app/forms/item/form";
import ButtonIconText from "../../button/button-icon-text";

interface ProductCardProps {
    product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
    return (
        <div className="relative p-4 bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow duration-200 w-full max-w-sm mx-auto">
            {/* Imagem do produto */}
            <div className="relative flex justify-center items-center">
                <Image
                    src={product.image_path}
                    alt={`Imagem do produto ${product.name}`}
                    width={200}
                    height={130}
                    className="rounded-lg mb-2 object-cover"
                />
                {/* Código do produto */}
                <span
                    className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded-lg opacity-80"
                    aria-label={`Código do produto ${product.code}`}
                >
                    #&nbsp;{product.code}
                </span>
            </div>

            {/* Informações do Produto */}
            <div className="text-center">
                <h2 className="font-bold text-lg mb-1">{product.name}</h2>
                <p className="text-gray-600 mb-2">R$ {product.price.toFixed(2)}</p>
            </div>

            {/* Tamanhos e botão */}
            <div className="flex items-center justify-between space-x-2">
                {/* Tamanhos */}
                {product.size && (
                    <div className="flex space-x-1">
                        <span
                            className="px-2 py-1 text-xs bg-gray-100 rounded-lg border border-gray-300 hover:bg-gray-200 focus:ring-2 focus:ring-blue-400 transition"
                            aria-label={`Tamanho disponível: ${product.size.name}`}
                        >
                            {product.size.name}
                        </span>
                    </div>
                )}

                {/* Botão para adicionar */}
                <ButtonIconText modalName={`add-item-${product.id}`}>
                    <AddProductCard product={product} />
                </ButtonIconText>
            </div>
        </div>
    );
};

export default ProductCard;
