import RequestError from "@/app/api/error";
import ButtonsModal from "@/app/components/modal/buttons-modal"
import ErrorForms from "@/app/components/modal/error-forms"
import { useModal } from "@/app/context/modal/context";
import Product from "@/app/entities/product/product";
import { useState } from "react";

interface AddProductCardProps {
  product: Product;
}

const AddProductCard = ({ product }: AddProductCardProps) => {
  const modalName = 'add-item-' + product.id
  const modalHandler = useModal();
  const [error, setError] = useState<RequestError | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const submit = () => {

  }

  return (
    <>
      <QuantitySelector />

      {error && <p className="mb-4 text-red-500">{error.message}</p>}
      <ErrorForms errors={errors} />
      <ButtonsModal onSubmit={submit} onCancel={() => modalHandler.hideModal(modalName)} />
    </>
  )
}

const QuantitySelector = () => {
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  return (
    <div className="flex items-center space-x-2 mt-2">
      {[1, 2, 3].map((quantity) => (
        <button
          key={quantity}
          className={`w-10 h-10 ${selectedQuantity === quantity ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
            } rounded-lg flex items-center justify-center hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`}
          onClick={() => setSelectedQuantity(quantity)}
        >
          {quantity}
        </button>
      ))}
    </div>
  );
};

export default AddProductCard