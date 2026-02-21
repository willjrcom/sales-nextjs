import { ColumnDef } from "@tanstack/react-table";
import Stock from "./stock";
import ButtonIcon from "@/app/components/button/button-icon";
import StockForm from "@/app/forms/stock/form";
import StockMovements from "@/app/components/stock/stock-movements";
import Decimal from "decimal.js";
import { FaEdit, FaMinus, FaPlus, FaSearch } from "react-icons/fa";
import AddStockForm from "@/app/forms/stock/add-stock";
import RemoveStockForm from "@/app/forms/stock/remove-stock";
import AdjustStockForm from "@/app/forms/stock/adjust-stock";

const StockColumns = (): ColumnDef<Stock>[] => [
  {
    id: 'Produto',
    accessorKey: 'product.name',
    header: 'Produto',
    cell: (info) => {
      const stock = info.row.original;
      const productName = stock.product?.name || "Produto não encontrado";
      const variationName = stock.product?.variations?.find(v => v.id === stock.product_variation_id)?.size?.name;
      return variationName ? `${productName} (${variationName})` : productName;
    },
  },
  {
    id: 'Estoque Atual',
    accessorKey: 'current_stock',
    header: 'Estoque Atual',
    cell: info => {
      const value = new Decimal(info.getValue() as any);
      return value.toFixed(2);
    },
  },
  {
    id: 'Estoque Mínimo',
    accessorKey: 'min_stock',
    header: 'Estoque Mínimo',
    cell: info => {
      const value = new Decimal(info.getValue() as any);
      return value.toFixed(2);
    },
  },
  {
    id: 'Estoque Máximo',
    accessorKey: 'max_stock',
    header: 'Estoque Máximo',
    cell: info => {
      const value = new Decimal(info.getValue() as any);
      return value.toFixed(2);
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
    id: 'Editar',
    header: 'Editar',
    cell: ({ row }) => {
      return (
        <div style={{ display: 'flex', gap: 8 }}>
          <ButtonIcon icon={FaPlus} modalName={"add-stock-" + row.original.id}
            title={"Adicionar estoque " + (row.original.product?.name || "")}>
            <AddStockForm key={"add:" + row.original.id} stock={row.original} />
          </ButtonIcon>

          <ButtonIcon icon={FaMinus} modalName={"remove-stock-" + row.original.id}
            title={"Remover estoque " + (row.original.product?.name || "")}>
            <RemoveStockForm key={"remove:" + row.original.id} stock={row.original} />
          </ButtonIcon >

          <ButtonIcon icon={FaEdit} modalName={"adjust-stock-" + row.original.id}
            title={"Ajustar estoque " + (row.original.product?.name || "")}>
            <AdjustStockForm key={"adjust:" + row.original.id} stock={row.original} />
          </ButtonIcon >
        </div>
      )
    },
  },
  {
    id: 'Historico',
    header: 'Historico',
    cell: info => {
      return (
        <div style={{ display: 'flex', gap: 8 }}>
          <ButtonIcon icon={FaSearch} modalName={"stock-movements-" + info.row.original.id}
            title={"Histórico de movimentos de " + (info.row.original.product?.name || "estoque")}>
            <StockMovements stockID={info.row.original.id} />
          </ButtonIcon>

          <ButtonIcon icon={FaEdit} modalName={"edit-stock-" + info.row.original.id}
            title={"Editar estoque " + (info.row.original.product?.name || "")}>
            <StockForm key={"edit:" + info.row.original.id} item={info.row.original} isUpdate={true} />
          </ButtonIcon>
        </div>
      )
    },
  },
];

export default StockColumns 