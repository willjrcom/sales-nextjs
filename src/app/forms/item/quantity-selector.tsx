import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect, useMemo } from "react";
import GetQuantitiesByCategoryID from "@/app/api/quantity/quantity";
import Quantity from "@/app/entities/quantity/quantity";

interface QuantitySelectorProps {
    categoryID: string
    selectedQuantity: Quantity
    setSelectedQuantity: (quantity: Quantity) => void
}

const QuantitySelector = ({ categoryID, selectedQuantity, setSelectedQuantity }: QuantitySelectorProps) => {
    const { data } = useSession();

    const { data: quantitiesResponse } = useQuery({
        queryKey: ['quantities', categoryID],
        queryFn: () => GetQuantitiesByCategoryID(data!, categoryID),
        enabled: !!data?.user?.access_token,
        refetchInterval: 60000,
    });

    const quantities = useMemo(() => quantitiesResponse || [], [quantitiesResponse]);
    const filteredQuantities = useMemo(() => quantities.filter((quantity) => quantity.is_active), [quantities]);

    useEffect(() => {
        filteredQuantities.forEach((quantity) => {
            if (quantity.quantity === 1) setSelectedQuantity(quantity);
        })
    }, [filteredQuantities])

    return (
        <div className="mb-4">
            <div className="flex flex-col mt-2 space-y-2">
                <label className="block text-gray-700 text-sm font-bold">
                    Selecione uma quantidade:
                </label>

                <div className="flex flex-wrap gap-2">
                    {filteredQuantities.map((quantity) => (
                        <button
                            key={quantity.id}
                            className={`w-10 h-10 ${selectedQuantity.id === quantity.id
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-black"
                                } rounded-lg flex items-center justify-center hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`}
                            onClick={() => setSelectedQuantity(quantity)}
                        >
                            {quantity.quantity}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuantitySelector