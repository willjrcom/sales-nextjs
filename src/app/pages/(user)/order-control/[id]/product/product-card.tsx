import Product from "@/app/entities/product/product";
import Image from "next/image";
import AddProductCard from "@/app/forms/item/form";
import ButtonIconText from "../../../../../components/button/button-icon-text";
import Decimal from "decimal.js";

interface ProductCardProps {
    product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
    const variations = product.variations || [];
    const prices = variations.map(v => new Decimal(v.price));
    const minPrice = prices.length > 0 ? Decimal.min(...prices) : new Decimal(0);
    const maxPrice = prices.length > 0 ? Decimal.max(...prices) : new Decimal(0);
    const sizes = Array.from(new Set(variations.map(v => v.size?.name).filter(Boolean))).join(', ');
    const isAvailable = variations.some(v => v.is_available);

    return (
        <div className="relative p-3 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 w-full">
            {/* Imagem do produto */}
            <div className="relative flex justify-center items-center">
                {product.image_path ? (
                    <Image
                        src={product.image_path}
                        alt={`Imagem do produto ${product.name}`}
                        width={150}
                        height={100}
                        className="rounded-md mb-2 object-cover"
                    />
                ) : (
                    <div
                        className="rounded-md mb-2 bg-gray-200 flex items-center justify-center"
                        style={{ width: '150px', height: '100px' }}
                    >
                        <span className="text-gray-500 text-xs">Sem imagem</span>
                    </div>
                )}

                {/* SKU do produto */}
                <span
                    className="absolute top-1 right-1 bg-black text-white text-xs px-1.5 py-0.5 rounded opacity-80"
                    aria-label={`SKU do produto ${product.sku}`}
                >
                    #{product.sku}
                </span>
            </div>

            {/* Informações do Produto */}
            <div className="text-center">
                <h2 className="font-semibold text-sm mb-1 line-clamp-1" title={product.name}>{product.name}</h2>
                <div className="text-gray-700 font-bold text-sm mb-1.5">
                    {minPrice.equals(maxPrice) ? (
                        `R$ ${minPrice.toFixed(2)}`
                    ) : (
                        `R$ ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}`
                    )}
                </div>

                {/* Chips de categoria e tamanho */}
                <div className="flex flex-wrap justify-center gap-1 mb-2">
                    {product.category?.name && (
                        <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                            {product.category.name}
                        </span>
                    )}
                    {sizes && (
                        <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full border border-gray-300">
                            {sizes}
                        </span>
                    )}
                </div>

                {/* Sabores */}
                {product.flavors && product.flavors.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1 mb-2">
                        {product.flavors.slice(0, 3).map((flavor, index) => (
                            <span
                                key={`${product.id}-${index}-${flavor}`}
                                className="px-1.5 py-0.5 text-xs bg-orange-100 text-orange-800 rounded-full border border-orange-200"
                            >
                                {flavor}
                            </span>
                        ))}
                        {product.flavors.length > 3 && (
                            <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                                +{product.flavors.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Botão */}
            <div className="mt-2 flex items-center justify-between">
                {isAvailable && <ButtonIconText modalName={`add-item-${product.id}`} size={product.image_path ? 'xl' : 'md'}>
                    <AddProductCard product={product} />
                </ButtonIconText>}
                {!isAvailable && <span className="text-xs text-gray-500">Indisponível</span>}
            </div>
        </div>
    );
};

export default ProductCard;
