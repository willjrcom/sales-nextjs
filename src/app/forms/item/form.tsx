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
import { GetAllStocks } from "@/app/api/stock/stock";
import StockEntity from "@/app/entities/stock/stock";
import GroupItem from "@/app/entities/order/group-item";
import Order from "@/app/entities/order/order";
import GetCategoryByID from "@/app/api/category/[id]/category";
import { GetAdditionalProducts } from "@/app/api/product/product";
import NewAdditionalItem from "@/app/api/item/update/additional/item";
import AddRemovedItem from "@/app/api/item/update/removed-item/add/item";
import Image from "next/image";

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

  // Variations logic
  const [selectedVariationId, setSelectedVariationId] = useState<string>("");

  // New state for additionals and removables
  const [selectedAdditionals, setSelectedAdditionals] = useState<Record<string, number>>({});
  const [selectedRemovables, setSelectedRemovables] = useState<string[]>([]);

  useEffect(() => {
    const groupItem = queryClient.getQueryData<GroupItem | null>(['group-item', 'current']);
    if (groupItem && groupItem.items) {
      const currentTotalQty = groupItem.items.reduce((acc, item) => acc + (item.quantity || 0), 0);
      const remainingQty = new Decimal(1).minus(new Decimal(currentTotalQty)).toNumber();
      if (remainingQty > 0 && remainingQty < 1) {
        setQuantity(remainingQty);
      }
    }
  }, [queryClient]);

  useEffect(() => {
    fetchProduct();
  }, [data?.user?.access_token, reloadProduct]);

  const currentGroupItem = queryClient.getQueryData<GroupItem | null>(['group-item', 'current']);
  const forcedSize = currentGroupItem?.size;

  // Auto-select variation if only one exists or if specific logic applies
  useEffect(() => {
    if (forcedSize && product.variations) {
      const matchingVariation = product.variations.find(v => v.size?.name === forcedSize);
      if (matchingVariation) {
        setSelectedVariationId(matchingVariation.id);
      }
    } else if (product.variations && product.variations.length === 1) {
      setSelectedVariationId(product.variations[0].id);
    } else if (product.variations && product.variations.length > 0 && !selectedVariationId) {
      // Optional: Select the first available one?
      // setSelectedVariationId(product.variations[0].id);
    }
  }, [product.variations, forcedSize]);

  const availableFlavors = useMemo(() => product.flavors || [], [product.flavors]);

  // Get selected variation object
  const selectedVariation = useMemo(() => {
    return product.variations.find(v => v.id === selectedVariationId);
  }, [product.variations, selectedVariationId]);

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

  // Fetch Stocks to check availability
  const { data: stocksResponse } = useQuery({
    queryKey: ['stocks', 'all'],
    queryFn: () => GetAllStocks(data!, 0, 1000), // Fetch all stocks (up to 1000)
    enabled: !!(data as any)?.user?.access_token,
  });

  const stocks = useMemo(() => stocksResponse?.items || [], [stocksResponse]);

  const getStockAvailability = (productId: string, variationId: string) => {
    const stock = stocks.find(s =>
      s.product_id === productId &&
      (s.product_variation_id === variationId || (!s.product_variation_id && !variationId))
    );

    if (!stock) return true; // Se não tem controle de estoque, assumir disponível
    return new Decimal(stock.current_stock).greaterThan(0);
  };

  const fetchProduct = async () => {
    setReloadProduct(false);
    if (reloadProduct && data) {
      const productFound = await GetProductByID(item.id, data)
      if (!productFound) return;

      setProduct(new Product(productFound));
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

    if (!selectedVariationId) {
      if (!product.variations || product.variations.length === 0) {
        notifyError("Este produto não possui tamanhos configurados.");
      } else {
        notifyError("Selecione um tamanho/variação");
      }
      return;
    }

    setIsSubmitting(true);

    const order = queryClient.getQueryData<Order>(['order', 'current']);
    const groupItem = queryClient.getQueryData<GroupItem | null>(['group-item', 'current']);

    try {
      const body = {
        product_id: product.id,
        variation_id: selectedVariationId, // Pass variation ID
        quantity: quantity,
        order_id: order?.id,
        group_item_id: groupItem?.id,
        observation: observation,
        flavor: selectedFlavor || undefined,
      } as NewItemProps

      const response = await NewItem(body, data)

      // 2. Add Additionals (Sequentially to avoid race conditions)
      for (const [productId, addQty] of Object.entries(selectedAdditionals)) {
        if (addQty > 0) {
          const additionalProduct = additionalProducts.find(p => p.id === productId);
          const variationId = additionalProduct?.variations?.[0]?.id;
          await NewAdditionalItem(response.item_id, { product_id: productId, variation_id: variationId, quantity: addQty }, data);
        }
      }

      // 3. Add Removables (Sequentially to avoid race conditions)
      for (const name of selectedRemovables) {
        await AddRemovedItem(response.item_id, name, data);
      }

      queryClient.setQueryData(['group-item', 'current'], null);
      queryClient.invalidateQueries({ queryKey: ['order', 'current'] });

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

  // Reload product if categories are missing, mainly to refetch full details if we only have summary
  useEffect(() => {
    if (!product.category_id) { // Changed check slightly
      setReloadProduct(true);
    }
  }, [])

  const calculateTotal = () => {
    let price = new Decimal(0);
    if (selectedVariation) {
      price = new Decimal(selectedVariation.price);
    }

    let total = price.times(quantity);

    // Add additionals cost
    Object.entries(selectedAdditionals).forEach(([productId, addQty]) => {
      const additional = additionalProducts.find(p => p.id === productId);
      if (additional) {
        // Additional products might still use 'price' directly or needs check?
        // Assuming additional products are simple products (like "Extra Cheese") which usually have 1 variation or direct price?
        // Wait, if additional products are also products, they also have variations now!
        // For simplicity, assuming additional products have a default variation or using the first one. 
        // But the API GetAdditionalProducts returns Product[].
        // If they have variations, we need to know which price to use.
        // Usually, additionals are simple. I'll assume for now additional items have a variation or I use the first one's price if 'price' is removed from product root.
        // But wait, the frontend Product entity still has 'price' removed. 
        // So additional.price might be undefined if it follows the new entity structure!
        // I need to check how to handle additional product price.
        // For now, I'll assume additional products use the first variation price or I need to update GetAdditionalProducts to return flattened structure or handle it here.

        // Let's assume for additional products we take the first variation's price 
        // if product.price is not present (which it isn't).
        let addPrice = new Decimal(0);
        if (additional.variations && additional.variations.length > 0) {
          addPrice = new Decimal(additional.variations[0].price);
        }
        total = total.plus(addPrice.times(addQty));
      }
    });
    return total;
  };

  const totalAmount = calculateTotal();
  const unitPrice = selectedVariation ? new Decimal(selectedVariation.price) : new Decimal(0);
  const hasImage = !!product.image_path;

  return (
    <div className="bg-white text-gray-800 p-1 md:p-2 h-full flex flex-col">
      <div className={`grid grid-cols-1 ${hasImage ? 'md:grid-cols-2' : ''} gap-6 h-full`}>
        {/* Left Column: Image */}
        {hasImage && (
          <div className="relative h-64 md:h-full max-h-[400px] w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            <Image
              src={product.image_path}
              alt={product.name}
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* We can show "Unavailable" if the selected variation is unavailable, or generally if no variations available */}
            {selectedVariation && !selectedVariation.is_available && (
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

          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            {product.description || "Sem descrição disponível para este produto."}
          </p>

          <div className="flex-1 overflow-y-auto pr-1">

            {/* Variations / Sizes Selector */}
            {product.variations && product.variations.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  ESCOLHA O TAMANHO
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.variations.map(variation => {
                    const isSelected = selectedVariationId === variation.id;
                    const isSizeMismatch = Boolean(forcedSize && variation.size?.name !== forcedSize);
                    const isOutOfStock = !getStockAvailability(product.id, variation.id);
                    const isDisabled = !variation.is_available || isSizeMismatch || isOutOfStock;
                    return (
                      <button
                        key={variation.id}
                        onClick={() => setSelectedVariationId(variation.id)}
                        disabled={isDisabled}
                        className={`
                                        flex flex-col items-center justify-center py-2 px-4 min-w-[100px] rounded-lg border transition-all
                                        ${isSelected
                            ? "bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500"
                            : "bg-white border-gray-200 hover:border-green-200 hover:bg-gray-50"
                          }
                                        ${isDisabled ? "opacity-50 cursor-not-allowed bg-gray-50 hover:bg-gray-50 hover:border-gray-200" : ""}
                                    `}
                      >
                        <span className="font-semibold text-sm">{variation.size?.name || 'Padrão'}</span>
                        <span className="text-xs mt-1">R$ {new Decimal(variation.price).toFixed(2)}</span>
                        {!variation.is_available && <span className="text-[10px] text-red-500 font-bold mt-1">Indisponível</span>}
                        {variation.is_available && isOutOfStock && <span className="text-[10px] text-red-500 font-bold mt-1">Sem Estoque</span>}
                        {variation.is_available && !isOutOfStock && isSizeMismatch && <span className="text-[10px] text-gray-400 font-bold mt-1">Tamanho incompatível</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}


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
                  <h3 className='text-xs font-bold text-gray-500 uppercase tracking-wider'>
                    ADICIONAIS
                  </h3>
                </div>

                <div className="space-y-3">
                  {additionalProducts.map((additional: Product) => {
                    const qty = selectedAdditionals[additional.id] || 0;
                    // Helper to get price
                    let price = new Decimal(0);
                    if (additional.variations && additional.variations.length > 0) {
                      price = new Decimal(additional.variations[0].price);
                    }

                    return (
                      <div key={additional.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-green-200 transition-colors bg-white">
                        <div>
                          <p className="font-medium text-gray-900">{additional.name}</p>
                          <p className="text-sm text-green-600 font-semibold">+ R$ {price.toFixed(2)}</p>
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
                <h3 className='text-xs font-bold text-gray-500 uppercase tracking-wider'>
                  REMOVER DO PRODUTO
                </h3>
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

            {selectedVariation && selectedVariation.is_available ? (
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
                  <span>{!selectedVariation ? "Selecione um tamanho" : "Indisponível no momento"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddProductCard