import Product from "@/app/entities/product/product";
import Image from "next/image";
import AddProductCard from "@/app/forms/item/form";
import ButtonIconText from "../../../../../components/button/button-icon-text";
import Decimal from "decimal.js";

interface ListProductsProps {
    product: Product;
}

const ListProducts = ({ product }: ListProductsProps) => {
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

                {/* SKU do produto */}
                <span
                    className="absolute -top-1 -right-1 bg-black text-white text-xs px-1.5 py-0.5 rounded opacity-90"
                    aria-label={`SKU do produto ${product.sku}`}
                >
                    #{product.sku}
                </span>
            </div>

            {/* Informações do Produto */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm line-clamp-1" title={product.name}>
                        {product.name}
                    </h3>
                    <p className="text-gray-700 font-bold text-sm whitespace-nowrap">
                        {product.variations?.length > 0 ? (
                            `R$ ${new Decimal(Math.min(...product.variations.map(v => new Decimal(v.price).toNumber()))).toFixed(2)}`
                        ) : (
                            'Indisponível'
                        )}
                    </p>
                </div>

                {/* Chips de categoria e tamanho */}
                <div className="flex flex-wrap gap-1 mb-1.5">
                    {product.category?.name && (
                        <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                            {product.category.name}
                        </span>
                    )}
                    {Array.from(new Set(product.variations?.map(v => v.size?.name).filter(Boolean))).map(sizeName => (
                        <span key={sizeName} className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full border border-gray-300">
                            {sizeName}
                        </span>
                    ))}
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
            <div className="flex-shrink-0 ml-2 flex items-center justify-between">
                {product.variations?.some(v => v.is_available) && <ButtonIconText modalName={`add-item-${product.id}`} size={product.image_path ? 'xl' : 'md'}>
                    <AddProductCard product={product} />
                </ButtonIconText>}
                {!product.variations?.some(v => v.is_available) && <span className="text-xs text-gray-500">Indisponível</span>}
            </div>
        </div>
    );
};

export default ListProducts;
