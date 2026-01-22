import Product from "@/app/entities/product/product";
import Image from "next/image";
import AddProductCard from "@/app/forms/item/form";
import ButtonIconText from "../../button/button-icon-text";
import Decimal from "decimal.js";

interface ProductListItemProps {
    product: Product;
}

const ProductListItem = ({ product }: ProductListItemProps) => {
    return (
        <div className="relative flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 w-full max-w-4xl mx-auto">
            {/* Imagem do produto */}
            <div className="relative flex-shrink-0">
                {product.image_path ? (
                    <Image
                        src={product.image_path}
                        alt={`Imagem do produto ${product.name}`}
                        width={80}
                        height={80}
                        className="rounded-md object-cover"
                    />
                ) : (
                    <div
                        className="rounded-md bg-gray-200 flex items-center justify-center"
                        style={{ width: '80px', height: '80px' }}
                    >
                        <span className="text-gray-500 text-xs">Sem imagem</span>
                    </div>
                )}

                {/* Código do produto */}
                <span
                    className="absolute -top-1 -right-1 bg-black text-white text-xs px-1.5 py-0.5 rounded opacity-90"
                    aria-label={`Código do produto ${product.code}`}
                >
                    #{product.code}
                </span>
            </div>

            {/* Informações do Produto */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm line-clamp-1" title={product.name}>
                        {product.name}
                    </h3>
                    <p className="text-gray-700 font-bold text-sm whitespace-nowrap">
                        R$ {new Decimal(product.price).toFixed(2)}
                    </p>
                </div>

                {/* Chips de categoria e tamanho */}
                <div className="flex flex-wrap gap-1 mb-1.5">
                    {product.category?.name && (
                        <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                            {product.category.name}
                        </span>
                    )}
                    {product.size?.name && (
                        <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full border border-gray-300">
                            {product.size.name}
                        </span>
                    )}
                </div>

                {/* Sabores */}
                {product.flavors && product.flavors.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {product.flavors.slice(0, 2).map((flavor, index) => (
                            <span
                                key={`${product.id}-${index}-${flavor}`}
                                className="px-1.5 py-0.5 text-xs bg-orange-100 text-orange-800 rounded-full border border-orange-200"
                            >
                                {flavor}
                            </span>
                        ))}
                        {product.flavors.length > 2 && (
                            <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                                +{product.flavors.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Botão */}
            <div className="flex-shrink-0">
                <ButtonIconText modalName={`add-item-${product.id}`} isDisabled={!product.is_available} size="md">
                    <AddProductCard product={product} />
                </ButtonIconText>
            </div>
        </div>
    );
};

export default ProductListItem;
