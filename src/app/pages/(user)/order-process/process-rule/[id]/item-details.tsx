import Item from '@/app/entities/order/item';
import React from 'react';
import AdditionalItem from './additional-item';
import RemovedItem from './removed-item';
import Product from '@/app/entities/product/product';

interface ItemDetailsProps {
    item: Item;
    product?: Product;
}

const ItemDetails = ({ item, product }: ItemDetailsProps) => {
    return (
        <div className="">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <p className="text-gray-500 text-sm"># {item.id}</p>
                </div>
                <div className="text-gray-700 text-lg">
                    Quantidade: <span className="font-bold">{item.quantity}</span>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-2 gap-4">
                {/* Ingredientes */}
                <div className="bg-gray-50 rounded-lg shadow p-4">
                    <h2 className="font-semibold text-lg mb-4">Descrição</h2>
                    <ul className="space-y-2">
                        <li>{product?.description}</li>
                    </ul>
                </div>

                {/* Adicionais */}
                <div className="bg-gray-50 rounded-lg shadow p-4">
                    <h2 className="font-semibold text-lg mb-4">Adicionais</h2>

                    <div className="mt-2 flex flex-wrap gap-2">
                        {item.additional_items?.map((additional) => (
                            <AdditionalItem key={additional.id} item={additional} />
                        ))}
                    </div>
                </div>

                {/* Remover */}
                <div className="bg-gray-50 rounded-lg shadow p-4">
                    <h2 className="font-semibold text-lg mb-4">Remover</h2>

                    <div className='mt-2 flex flex-wrap gap-2'>
                        {item.removed_items?.map((removedItem) => (
                            <RemovedItem key={removedItem} item={removedItem} />
                        ))}
                    </div>
                </div>

                {/* Observações */}
                <div className="bg-gray-50 rounded-lg shadow p-4">
                    <h2 className="font-semibold text-lg mb-4">Observações</h2>
                    {item.observation && <p className="text-red-500">{item.observation}</p>}
                    {!item.observation && <p className="text-gray-500">Nenhuma observação</p>}
                </div>
            </div>
        </div>
    );
};

export default ItemDetails;
