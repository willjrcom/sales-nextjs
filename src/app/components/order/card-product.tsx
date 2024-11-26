import Product from "@/app/entities/product/product";

interface ProductCardProps {
    product: Product;
}
import Image from 'next/image';
import { FaPlus } from "react-icons/fa";

const ProductCard = ({ product }: ProductCardProps) => {
    return (
        <div className="relative p-4 bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow duration-200">
            {/* Imagem do produto */}
            <div className="relative flex justify-center items-center">
                <Image
                    src={product.image_path}
                    alt={product.name}
                    width={200}
                    height={130}
                    className="rounded-lg mb-2 object-cover"
                />
                {/* Código do produto */}
                <span className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded-lg opacity-80">
                    #&nbsp;{product.code}
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
                <span
                            key={product.size.name}
                            className="px-2 py-1 text-xs bg-gray-100 rounded-lg border border-gray-300 hover:bg-gray-200 focus:ring-2 focus:ring-blue-400 transition"
                        >
                            {product.size.name}
                        </span>
                </div>
                {/* Botão Adicionar */}
                <button className="px-3 py-2 bg-gray-300 text-white rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-400 transition">
                    <FaPlus/>
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
