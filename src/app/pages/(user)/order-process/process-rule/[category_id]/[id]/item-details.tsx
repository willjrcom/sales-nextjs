import Item from '@/app/entities/order/item';
import React from 'react';
import AdditionalItem from '../../../../../../components/order/additional-item';
import RemovedItem from '../../../../../../components/order/removed-item';
import Product from '@/app/entities/product/product';
import { FaRegImage } from 'react-icons/fa';
import { useModal } from '@/app/context/modal/context';
import ObservationCard from '@/app/components/order/observation';
import Image from 'next/image';

interface ItemDetailsProps {
    item: Item;
    product?: Product;
}

const ItemDetails = ({ item, product }: ItemDetailsProps) => {
    const modalHandler = useModal();
    const openImage = () => {
        if (!product?.image_path) return;
        modalHandler.showModal(
            `product-image-${item.id}`,
            product.name,
            <Image
                src={product.image_path}
                alt={product.name}
                className="w-auto h-auto rounded"
                width={100}
                height={100}
            />,
            'xl',
            () => modalHandler.hideModal(`product-image-${item.id}`)
        );
    };
    return (
        <>
            <div className="flex bg-white rounded-lg shadow mb-4 p-4">
                {/* Left: Product Thumbnail */}
                <div className="w-24 h-24 flex-shrink-0 mr-4 cursor-pointer" onClick={openImage}>
                    {product?.image_path ? (
                        <Image
                            src={product.image_path}
                            alt={product.name}
                            className="w-full h-full object-cover rounded"
                            width={100}
                            height={100}
                        />
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
                        <p className="text-md text-bold">{item.name}</p>
                        <p className="text-gray-700 text-lg">Quantidade: <span className="font-bold">{item.quantity}</span></p>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Description */}
                        <div className="bg-gray-50 rounded-lg shadow p-3">
                            <h3 className="font-semibold text-md mb-2">Descrição</h3>
                            <p className="text-gray-600 text-sm">{product?.description || 'Sem descrição'}</p>
                        </div>

                        {item.flavor && (
                            <div className="bg-orange-50 rounded-lg shadow p-3">
                                <h3 className="font-semibold text-md mb-2">Sabor selecionado</h3>
                                <p className="text-orange-700 text-sm font-medium">{item.flavor}</p>
                            </div>
                        )}

                        <div className='bg-gray-50 rounded-lg shadow p-3 space-y-2 space-x-2'>
                            {item.observation && (
                                <ObservationCard observation={item.observation} />
                            )}

                            {item.additional_items?.map((add) => (
                                <AdditionalItem item={add} key={add.id} />
                            ))}
                            {item.removed_items?.map((rem) => (
                                <RemovedItem item={rem} key={rem} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ItemDetails;
