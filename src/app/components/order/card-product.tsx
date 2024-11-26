import Product from "@/app/entities/product/product";

interface ProductCardProps {
    product: Product;
}
import Image from 'next/image';

const ProductCard = ({ product }: ProductCardProps) => {
    return (
        <div className="relative p-4 bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow duration-200">
            {/* Imagem do produto */}
            <div className="relative">
                <Image
                    src={product.image_path}
                    alt={product.name}
                    width={200}
                    height={130}
                    className="rounded-lg mb-2 object-cover"
                />
                {/* Código do produto */}
                <span className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded-lg opacity-80">
                    #{product.code}
                </span>
            </div>

            {/* Informações do Produto */}
            <div className="text-center">
                <h2 className="font-bold text-lg mb-1">{product.name}</h2>
                <p className="text-gray-600 mb-2">R$ {product.price}</p>
            </div>

            {/* Tamanhos e botão */}
            <div className="flex items-center justify-between space-x-2">
                {/* Tamanhos */}
                <div className="flex space-x-1">
                    {["P", "M", "G"].map((size) => (
                        <button
                            key={size}
                            className="px-2 py-1 text-xs bg-gray-100 rounded-lg border border-gray-300 hover:bg-gray-200 focus:ring-2 focus:ring-blue-400 transition"
                        >
                            {size}
                        </button>
                    ))}
                </div>
                {/* Botão Adicionar */}
                <button className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 transition">
                    +
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
