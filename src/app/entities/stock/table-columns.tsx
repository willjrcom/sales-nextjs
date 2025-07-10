import { ColumnDef } from "@tanstack/react-table";
import Stock from "./stock";
import ButtonIcon from "@/app/components/button/button-icon";
import StockForm from "@/app/forms/stock/form";
import StockMovements from "@/app/components/stock/stock-movements";
import Decimal from "decimal.js";
import { FaHistory } from "react-icons/fa";

const StockColumns = (): ColumnDef<Stock>[] => [
  {
    id: 'Produto',
    accessorKey: 'product.name',
    header: 'Produto',
    cell: (info) => info.row.original.product?.name || "Produto não encontrado",
  },
  {
    id: 'Estoque Atual',
    accessorKey: 'current_stock',
    header: 'Estoque Atual',
    cell: info => {
      const value = new Decimal(info.getValue() as any);
      return `${value.toFixed(2)} ${info.row.original.unit}`;
    },
  },
  {
    id: 'Estoque Mínimo',
    accessorKey: 'min_stock',
    header: 'Estoque Mínimo',
    cell: info => {
      const value = new Decimal(info.getValue() as any);
      return `${value.toFixed(2)} ${info.row.original.unit}`;
    },
  },
  {
    id: 'Estoque Máximo',
    accessorKey: 'max_stock',
    header: 'Estoque Máximo',
    cell: info => {
      const value = new Decimal(info.getValue() as any);
      return `${value.toFixed(2)} ${info.row.original.unit}`;
    },
  },
  {
    id: 'Unidade',
    accessorKey: 'unit',
    header: 'Unidade',
  },
  {
    id: 'Status',
    accessorKey: 'is_active',
    header: 'Status',
    cell: info => {
      const stock = info.row.original;
      const current = new Decimal(stock.current_stock);
      const min = new Decimal(stock.min_stock);
      const max = new Decimal(stock.max_stock);
      
      if (!stock.is_active) return 'Inativo';
      if (current.lessThanOrEqualTo(0)) return 'Sem Estoque';
      if (current.lessThanOrEqualTo(min)) return 'Estoque Baixo';
      if (max.greaterThan(0) && current.greaterThan(max)) return 'Estoque Alto';
      return 'Normal';
    },
  },
  {
    id: 'Histórico',
    accessorKey: 'id',
    header: 'Histórico',
    cell: ({ row }) => {
      return (
        <ButtonIcon modalName={"stock-movements-" + row.original.id }
          title={"Histórico de movimentos de " + (row.original.product?.name || "produto")}>
          <StockMovements stockID={row.original.id} />
        </ButtonIcon>
      )
    },
  },
  {
    id: 'Editar',
    accessorKey: 'id',
    header: 'Editar',
    cell: ({ row }) => {
      return (
        <ButtonIcon modalName={"edit-stock-" + row.original.id }
          title={"Editar estoque de " + (row.original.product?.name || "produto")}>
          <StockForm
            item={row.original} 
            isUpdate={true}/>
        </ButtonIcon>
      )
    },
  },
];

export default StockColumns 