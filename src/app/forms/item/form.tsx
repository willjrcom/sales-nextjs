"use client"

import RequestError from "@/app/utils/error";
import NewItem, { NewItemProps } from "@/app/api/item/new/item";
import GetProductByID from "@/app/api/product/[id]/product";
import ButtonsModal from "@/app/components/modal/buttons-modal"
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import NumericField from "@/app/components/modal/fields/numeric";
import { TextField } from "@/app/components/modal/field";
import { useModal } from "@/app/context/modal/context";
import Product from "@/app/entities/product/product";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import Decimal from "decimal.js";
import { useQueryClient } from '@tanstack/react-query';
import GroupItem from "@/app/entities/order/group-item";
import Order from "@/app/entities/order/order";
import GetGroupItemByID from "@/app/api/group-item/[id]/group-item";

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

  useEffect(() => {
    fetchProduct();
  }, [data?.user?.access_token, reloadProduct]);

  const availableFlavors = useMemo(() => product.flavors || [], [product.flavors]);

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

  const submit = async () => {
    if (!data) return;

    if (quantity == 0) return notifyError("Selecione uma quantidade para continuar");

    const requiresFlavorSelection = availableFlavors && availableFlavors.length > 0;
    if (requiresFlavorSelection && !selectedFlavor) {
      notifyError("Selecione um sabor para continuar");
      return;
    }


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

      const updatedGroupItem = await GetGroupItemByID(response.group_item_id, data);
      queryClient.setQueryData(['group-item', 'current'], updatedGroupItem);

      notifySuccess(`Item ${item.name} adicionado com sucesso`);
      modalHandler.hideModal(modalName);
    } catch (error) {
      const err = error as RequestError;
      notifyError(err.message || 'Erro ao adicionar item');
    }
  }

  useEffect(() => {
    if (!product.size || !product.category) {
      setReloadProduct(true);
    }
  }, [])

  if (!product.category) {
    return notifyError("Produto sem categoria");
  }

  if (!product.size) {
    return notifyError("Produto sem tamanho");
  }

  return (
    <div className="overflow-y-auto text-black space-y-6">
      {/* Seção: Informações do Produto */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">{product.name}</h3>
        <div className="space-y-2">
          <p className="text-sm font-bold">Descrição: <span className="font-normal">{product.description}</span></p>
          <p className="text-sm font-bold">Tamanho: <span className="font-normal">{product.size.name}</span></p>
          {product.flavors && product.flavors.length > 0 && (
            <div>
              <p className="text-sm font-bold mb-1">Sabores disponíveis:</p>
              <div className="flex flex-wrap gap-2">
                {product.flavors.map((flavor, index) => (
                  <span
                    key={`${product.id}-${index}-${flavor}`}
                    className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full border border-orange-200"
                  >
                    {flavor}
                  </span>
                ))}
              </div>
              {selectedFlavor && (
                <p className="text-xs text-green-700 mt-2">
                  Sabor selecionado: <span className="font-semibold">{selectedFlavor}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Seção: Quantidade e Observação */}
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm border border-blue-100 p-6 transition-all duration-300 hover:shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-blue-200">Configurações</h3>
        <div className="space-y-4">
          {product.flavors && product.flavors.length > 0 && (
            <div className="transform transition-transform duration-200 hover:scale-[1.01]">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Selecione um sabor:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.flavors.map((flavor) => {
                  const isSelected = selectedFlavor === flavor;
                  return (
                    <button
                      type="button"
                      key={`${product.id}-selector-${flavor}`}
                      className={`px-3 py-1 rounded-full border text-sm transition
                        ${isSelected ? "bg-orange-500 text-white border-orange-600" : "bg-white text-gray-700 border-gray-300"}
                        hover:shadow focus:outline-none focus:ring-2 focus:ring-orange-400`}
                      onClick={() => setSelectedFlavor(flavor)}
                    >
                      {flavor}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">Obrigatório selecionar um sabor para produtos com variações.</p>
            </div>
          )}
          <NumericField name="quantity" friendlyName="Quantidade" placeholder="Digite a quantidade" setValue={setQuantity} value={quantity} />
          <div className="transform transition-transform duration-200 hover:scale-[1.01]">
            <TextField friendlyName="Observação" name="observation" placeholder="Digite a observação" setValue={setObservation} value={observation} optional />
          </div>
        </div>
      </div>

      {/* Seção: Valores */}
      <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm border border-green-100 p-6 transition-all duration-300 hover:shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-green-200">Valores</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <p className="text-lg font-bold">Valor unitário:</p>
            <p className="text-lg font-bold text-green-600">R$ {new Decimal(product.price).toFixed(2)}</p>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <p className="text-lg font-bold">Total:</p>
            <p className="text-lg font-bold text-green-600">R$ {new Decimal(product.price).times(quantity).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {product.is_available && <ButtonsModal item={product} name="produto" onSubmit={submit} isAddItem={true} />}
      {!product.is_available && <p className="text-center font-bold text-red-600">Produto indisponível</p>}
    </div>
  )
}

export default AddProductCard