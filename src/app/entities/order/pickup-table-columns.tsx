import { ColumnDef } from "@tanstack/react-table";
import Order from "./order";
import { BsSend } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const PickupOrderColumns = (
  showActions: boolean = true,
  onDeliver?: (id: string) => void,
  deliveringId?: string
): ColumnDef<Order>[] => {
  const columns: ColumnDef<Order>[] = [
    {
      id: 'Comanda',
      accessorKey: 'order_number',
      header: 'Comanda',
    },
    {
      id: 'Nome',
      accessorKey: 'name',
      header: 'Nome',
      accessorFn: row => {
        const name = row.pickup?.name
        if (!name) return 'Sem cliente'

        return name.substring(0, 15);
      },
    },
  ];

  if (showActions) {
    columns.push({
      id: 'Entregar',
      accessorKey: 'Entregar',
      cell: ({ row }) => {
        const isDelivering = deliveringId === row.original.pickup?.id;
        return (
          <Button
            size="lg"
            className="w-full font-black uppercase tracking-widest text-lg h-12 bg-emerald-600 hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-lg shadow-emerald-100"
            onClick={() => onDeliver?.(row.original.pickup!.id)}
            disabled={isDelivering}
          >
            {isDelivering ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <BsSend className="w-5 h-5 mr-3" />
                Entregar
              </>
            )}
          </Button>
        )
      }
    });
  }

  return columns;
};

export default PickupOrderColumns