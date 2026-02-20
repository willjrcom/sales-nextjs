import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Product from '@/app/entities/product/product';
import Decimal from 'decimal.js';
import { FaPlus } from 'react-icons/fa';
import { useModal } from '@/app/context/modal/context';
import AddProductCard from '@/app/forms/item/form';

interface ProductCardProps {
    product: Product;
    showQuickAdd?: boolean;
}

export function ProductCard({ product, showQuickAdd = false }: ProductCardProps) {
    const modalHandler = useModal();

    const handleOpenModal = () => {
        const modalName = `add-item-${product.id}`;
        const onClose = () => {
            modalHandler.hideModal(modalName);
        }
        modalHandler.showModal(modalName, "", <AddProductCard product={product} />, "md", onClose);
    };

    return (
        <Card className='p-3 flex flex-col h-full overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer' onClick={handleOpenModal}>
            <div className='relative rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3] group'>
                {product.image_path ? (
                    <Image
                        src={product.image_path}
                        alt={product.name}
                        fill
                        sizes='(max-width: 420px) 50vw, 25vw'
                        className='object-cover'
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-4xl font-bold opacity-20">{product.name.charAt(0)}</span>
                    </div>
                )}


                {/* Quick Add Button Overlay */}
                {showQuickAdd && (
                    <div
                        className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'
                    >
                        <div className='w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg'>
                            <FaPlus size={24} />
                        </div>
                    </div>
                )}
            </div>

            <div className='mt-3 flex-1 flex flex-col'>
                <div className='min-h-[3rem]'>
                    <h3 className='font-semibold leading-tight line-clamp-2 text-sm'>
                        {product.name}
                    </h3>
                </div>

                <div className='mt-2 flex items-center justify-between gap-2'>
                    <p className='text-xs text-gray-500 line-clamp-1 flex-1'>{product.description}</p>
                    <p className='font-semibold text-blue-600 whitespace-nowrap text-sm'>R$ {new Decimal(product.price || 0).toFixed(2)}</p>
                </div>
            </div>

            {!showQuickAdd && (
                <Button
                    className='mt-3 w-full bg-blue-50 text-blue-600 hover:bg-blue-100 border-none shadow-none h-8 text-xs'
                    variant='outline'
                    onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal();
                    }}
                >
                    + Adicionar
                </Button>
            )}
        </Card>
    );
}
