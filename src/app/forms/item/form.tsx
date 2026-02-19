"use client"

import RequestError from "@/app/utils/error";
import NewItem, { NewItemProps } from "@/app/api/item/new/item";
import GetProductByID from "@/app/api/product/[id]/product";
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import NumericField from "@/app/components/modal/fields/numeric";
import { useModal } from "@/app/context/modal/context";
import Product from "@/app/entities/product/product";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import Decimal from "decimal.js";
import { useQueryClient, useQuery } from '@tanstack/react-query';
import GroupItem from "@/app/entities/order/group-item";
import Order from "@/app/entities/order/order";
import GetGroupItemByID from "@/app/api/group-item/[id]/group-item";
import Image from "next/image";
import GetCategoryByID from "@/app/api/category/[id]/category";
import { GetAdditionalProducts } from "@/app/api/product/product";
import NewAdditionalItem from "@/app/api/item/update/additional/item";
import AddRemovedItem from "@/app/api/item/update/removed-item/add/item";

interface AddProductCardProps {
  product: Product;
}

const AddProductCard = ({ product: item }: AddProductCardProps) => {
  const modalName = 'add-item-' + item.id
  const modalHandler = useModal();
  const queryClient = useQueryClient();
  const { data } = useSession();
  const [product, setProduct] = useState<Product>(new Product(item));
  const [quantity, setQuantity] = useState<number>(1);
  const [observation, setObservation] = useState('');
  const [reloadProduct, setReloadProduct] = useState(false);
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(item?.flavors?.[0] || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New state for additionals and removables
  const [selectedAdditionals, setSelectedAdditionals] = useState<Record<string, number>>({});
  const [selectedRemovables, setSelectedRemovables] = useState<string[]>([]);

  useEffect(() => {
    fetchProduct();
  }, [data?.user?.access_token, reloadProduct]);

  const availableFlavors = useMemo(() => product.flavors || [], [product.flavors]);

  // Fetch Category for Removables
  const { data: category } = useQuery({
    queryKey: ['category', product.category_id],
    queryFn: () => GetCategoryByID(data!, product.category_id),
    enabled: !!data && !!product.category_id,
  });

  // Fetch Additional Products
  const { data: additionalProductsResponse } = useQuery({
    queryKey: ['additional-products', product.category_id],
    queryFn: () => GetAdditionalProducts(data!, product.category_id),
    enabled: !!data && !!product.category_id,
  });

  const additionalProducts = useMemo(() => additionalProductsResponse?.items || [], [additionalProductsResponse]);
  const removableIngredients = useMemo(() => category?.removable_ingredients || [], [category]);

  useEffect(() => {
    if (!availableFlavors.length) {
      setSelectedFlavor(null);
      return;
    }

    setSelectedFlavor((current) => {
      if (current && availableFlavors.includes(current)) {
        return current;
      }
      return availableFlavors[0];
    });
  }, [product.id, availableFlavors]);

  const fetchProduct = async () => {
    setReloadProduct(false);
    if (reloadProduct && data) {
      const productFound = await GetProductByID(item.id, data)
      if (!productFound) return;

      setProduct(productFound);
    }
  }

  const updateAdditional = (productId: string, delta: number) => {
    setSelectedAdditionals(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(0, Math.min(5, currentQty + delta));
      if (newQty === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQty };
    });
  };

  const toggleRemovable = (name: string) => {
    setSelectedRemovables(prev => {
      if (prev.includes(name)) {
        return prev.filter(i => i !== name);
      } else {
        return [...prev, name];
      }
    });
  };

  const submit = async () => {
    if (!data) return;

    if (quantity <= 0) return notifyError("Selecione uma quantidade válida");

    const requiresFlavorSelection = availableFlavors && availableFlavors.length > 0;
    if (requiresFlavorSelection && !selectedFlavor) {
      notifyError("Selecione um sabor para continuar");
      return;
    }

    setIsSubmitting(true);

    const order = queryClient.getQueryData<Order>(['order', 'current']);
    const groupItem = queryClient.getQueryData<GroupItem | null>(['group-item', 'current']);

    try {
      const body = {
        product_id: product.id,
        quantity: quantity,
        order_id: order?.id,
        group_item_id: groupItem?.id,
        observation: observation,
        flavor: selectedFlavor || undefined,
      } as NewItemProps

      const response = await NewItem(body, data)

      // 2. Add Additionals
      const additionalPromises = Object.entries(selectedAdditionals).map(async ([productId, addQty]) => {
        if (addQty > 0) {
          await NewAdditionalItem(response.item_id, { product_id: productId, quantity: addQty }, data);
        }
      });

      // 3. Add Removables
      const removablePromises = selectedRemovables.map(async (name) => {
        await AddRemovedItem(response.item_id, name, data);
      });

      await Promise.all([...additionalPromises, ...removablePromises]);

      const updatedGroupItem = await GetGroupItemByID(response.group_item_id, data);
      queryClient.setQueryData(['group-item', 'current'], updatedGroupItem);

      notifySuccess(`Item ${item.name} adicionado com sucesso`);
      modalHandler.hideModal(modalName);
      // Reset form
      setQuantity(1);
      setObservation('');
      setSelectedAdditionals({}); // Reset additionals
      setSelectedRemovables([]); // Reset removables
    } catch (error) {
      const err = error as RequestError;
      notifyError(err.message || 'Erro ao adicionar item');
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!product.size || !product.category) {
      setReloadProduct(true);
    }
  }, [])

  if (!product.category) {
    return <div className="p-4 text-center text-red-500">Erro: Produto sem categoria</div>;
  }

  const calculateTotal = () => {
    let total = new Decimal(product.price).times(quantity);

    // Add additionals cost
    Object.entries(selectedAdditionals).forEach(([productId, addQty]) => {
      const additional = additionalProducts.find(p => p.id === productId);
      if (additional) {
        total = total.plus(new Decimal(additional.price).times(addQty));
      }
    });
    return total;
  };

  const unitPrice = new Decimal(product.price);
  const totalAmount = calculateTotal();

  const hasImage = !!product.image_path;

  return (
    <div className="bg-white text-gray-800 p-1 md:p-2 h-full flex flex-col">
      <div className={`grid grid-cols-1 ${hasImage ? 'md:grid-cols-2' : ''} gap-6 h-full`}>
        {/* Left Column: Image */}
        {hasImage && (
          <div className="relative h-64 md:h-auto w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            <Image
              src={product.image_path}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Overlay badge for Availability or Promo if needed */}
            {!product.is_available && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-lg border-2 border-white px-4 py-2 rounded uppercase tracking-widest">
                  Indisponível
                </span>
              </div>
            )}
          </div>
        )}

        {/* Right Column: Form Details */}
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight flex-1 mr-4">
              {product.name}
            </h2>
            {product.sku && (
              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded border border-gray-200 whitespace-nowrap">
                SKU: {product.sku}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            {product.description || "Sem descrição disponível para este produto."}
          </p>

          <div className="flex-1 overflow-y-auto pr-1">
            {/* Flavor / Variant Selector */}
            {availableFlavors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  SABOR SELECIONADO
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableFlavors.map((flavor) => {
                    const isSelected = selectedFlavor === flavor;
                    return (
                      <button
                        key={flavor}
                        onClick={() => setSelectedFlavor(flavor)}
                        className={`
                          px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 border
                          ${isSelected
                            ? "bg-green-50 border-green-500 text-green-700 shadow-sm"
                            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                          }
                        `}
                      >
                        {flavor}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Adicionais */}
            {additionalProducts.length > 0 && (
              <div className='mb-6'>
                <div className='flex items-center gap-2 mb-3'>
                  <span className="text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg></span>
                  <h3 className='text-xs font-bold text-gray-500 uppercase tracking-wider'>
                    ADICIONAIS
                  </h3>
                </div>

                <div className="space-y-3">
                  {additionalProducts.map((additional: Product) => {
                    const qty = selectedAdditionals[additional.id] || 0;
                    return (
                      <div key={additional.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-green-200 transition-colors bg-white">
                        <div>
                          <p className="font-medium text-gray-900">{additional.name}</p>
                          <p className="text-sm text-green-600 font-semibold">+ R$ {new Decimal(additional.price).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {qty > 0 && (
                            <button
                              onClick={() => updateAdditional(additional.id, -1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
                            >
                              -
                            </button>
                          )}
                          {qty > 0 && <span className="font-semibold w-4 text-center">{qty}</span>}
                          <button
                            onClick={() => updateAdditional(additional.id, 1)}
                            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${qty > 0 ? 'bg-green-50 text-green-600 border border-green-100 hover:bg-green-100' : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100 hover:text-gray-600'}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Remover Ingredientes */}
            {removableIngredients.length > 0 && (
              <div className='mb-6'>
                <div className='flex items-center gap-2 mb-3'>
                  <span className="text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg></span>
                  <h3 className='text-xs font-bold text-gray-500 uppercase tracking-wider'>
                    REMOVER DO PRODUTO
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {removableIngredients.map((item: string) => {
                    const isRemoved = selectedRemovables.includes(item);
                    return (
                      <button
                        key={item}
                        onClick={() => toggleRemovable(item)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 ${isRemoved
                          ? 'bg-red-50 border-red-200 text-red-700 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        <span>{item}</span>
                        {isRemoved ? (
                          <span className="text-xs">✕</span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <NumericField name="quantity" friendlyName="Quantidade" placeholder="Digite a quantidade" setValue={setQuantity} value={quantity} />

            {/* Observations */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                OBSERVAÇÕES
              </h3>
              <textarea
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all resize-none"
                placeholder="Adicione instruções especiais para o seu pedido..."
                rows={3}
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
              />
            </div>
          </div>

          {/* Footer / Actions */}
          <div className="mt-auto pt-6 border-t border-gray-100">
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="block text-xs text-gray-500 mb-1">Valor Unitário</span>
                <span className="text-lg font-bold text-gray-900">
                  R$ {unitPrice.toFixed(2)}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-xs text-gray-500 mb-1">Valor Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  R$ {totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {product.is_available ? (
              <button
                onClick={submit}
                disabled={isSubmitting}
                className={`
                  w-full py-3.5 px-4 rounded-lg font-bold text-white shadow-sm transition-all transform active:scale-[0.99]
                  ${isSubmitting
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 hover:shadow-md"
                  }
                  flex items-center justify-center gap-2
                `}
              >
                {isSubmitting ? (
                  <span>Adicionando...</span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    <span>Adicionar ao Carrinho</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  disabled
                  className="w-full py-3.5 px-4 rounded-lg font-bold text-gray-500 bg-gray-200 cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>Indisponível no momento</span>
                </button>
                <p className="text-center text-xs text-gray-500 italic">
                  Avise-me quando este item estiver de volta ao estoque
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddProductCard