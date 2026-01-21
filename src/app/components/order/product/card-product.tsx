import Product from "@/app/entities/product/product";
import Image from "next/image";
import AddProductCard from "@/app/forms/item/form";
import ButtonIconText from "../../button/button-icon-text";
import Decimal from "decimal.js";

interface ProductCardProps {
    product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
    return (
        <div className="relative p-4 bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow duration-200 w-full max-w-sm mx-auto">
            {/* Imagem do produto */}
            <div className="relative flex justify-center items-center">
                {product.image_path ? (
                    <Image
                        src={product.image_path}
                        alt={`Imagem do produto ${product.name}`}
                        width={200}
                        height={130}
                        className="rounded-lg mb-2 object-cover"
                    />
                ) : (
                    <div
                        className="rounded-lg mb-2 bg-gray-200 flex items-center justify-center"
                        style={{ width: '200px', height: '130px' }}
                    >
                        <span className="text-gray-500">Imagem não disponível</span>
                    </div>
                )}

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
                <p className="text-gray-600 mb-2">R$ {new Decimal(product.price).toFixed(2)}</p>
                {product.flavors && product.flavors.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                        {product.flavors.map((flavor, index) => (
                            <span
                                key={`${product.id}-${index}-${flavor}`}
                                className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full border border-orange-200"
                            >
                                {flavor}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-4 flex items-end justify-between gap-3 border-t pt-3">
                {/* Chips */}
                <div className="flex flex-wrap gap-2">
                    {product.category?.name && (
                        <span
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full border border-blue-200"
                            aria-label={`Categoria: ${product.category.name}`}
                        >
                            {product.category.name}
                        </span>
                    )}

                    {product.size?.name && (
                        <span
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full border border-gray-300"
                            aria-label={`Tamanho disponível: ${product.size.name}`}
                        >
                            {product.size.name}
                        </span>
                    )}
                </div>

                {/* Botão */}
                <ButtonIconText modalName={`add-item-${product.id}`} isDisabled={!product.is_available}>
                    <AddProductCard product={product} />
                </ButtonIconText>
            </div>
        </div>
    );
};

export default ProductCard;
