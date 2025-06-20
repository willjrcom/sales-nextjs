import Item from '@/app/entities/order/item';
import React from 'react';
import AdditionalItem from './additional-item';
import RemovedItem from './removed-item';
import Product from '@/app/entities/product/product';
import { FaRegImage } from 'react-icons/fa';

interface ItemDetailsProps {
    item: Item;
    product?: Product;
}

const ItemDetails = ({ item, product }: ItemDetailsProps) => {
    console.log(product?.image_path)
    return (
        <div className="flex bg-white rounded-lg shadow mb-4 p-4">
            {/* Left: Product Thumbnail */}
            <div className="w-24 h-24 flex-shrink-0 mr-4">
                {product?.image_path ? (
                    <img src={product.image_path} alt={product.name}
                        className="w-full h-full object-cover rounded" />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded">
                        <FaRegImage className="text-gray-400 text-2xl" />
                    </div>
                )}
            </div>
            {/* Right: Details */}
            <div className="flex-1 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <p className="text-gray-500 text-sm"># {item.id}</p>
                    <p className="text-gray-700 text-lg">Quantidade: <span className="font-bold">{item.quantity}</span></p>
                </div>
                {/* Content Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Description */}
                    <div className="bg-gray-50 rounded-lg shadow p-3">
                        <h3 className="font-semibold text-md mb-2">Descrição</h3>
                        <p className="text-gray-600 text-sm">{product?.description || 'Sem descrição'}</p>
                    </div>
                    {/* Additional Items */}
                    <div className="bg-gray-50 rounded-lg shadow p-3">
                        <h3 className="font-semibold text-md mb-2">Adicionais</h3>
                        <div className="flex flex-wrap gap-2">
                            {item.additional_items?.map(add => <AdditionalItem key={add.id} item={add} />) || <p className="text-gray-500 text-sm">Nenhum adicional</p>}
                        </div>
                    </div>
                    {/* Removed Items */}
                    <div className="bg-gray-50 rounded-lg shadow p-3">
                        <h3 className="font-semibold text-md mb-2">Remover</h3>
                        <div className="flex flex-wrap gap-2">
                            {item.removed_items?.map(rem => <RemovedItem key={rem} item={rem} />) || <p className="text-gray-500 text-sm">Nenhum item removido</p>}
                        </div>
                    </div>
                    {/* Observation */}
                    <div className="bg-gray-50 rounded-lg shadow p-3">
                        <h3 className="font-semibold text-md mb-2">Observações</h3>
                        {item.observation ? <p className="text-red-500 text-sm">{item.observation}</p> : <p className="text-gray-500 text-sm">Nenhuma observação</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetails;
