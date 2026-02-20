import { ColumnDef } from "@tanstack/react-table";
import Product from "./product";
import ButtonIcon from "@/app/components/button/button-icon";
import ProductForm from "@/app/forms/product/form";
import Decimal from "decimal.js";

const ProductColumns = (): ColumnDef<Product>[] => [
  {
    id: 'SKU',
    accessorKey: 'sku',
    header: 'SKU',
  },
  {
    id: 'Nome',
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    id: 'Preço',
    accessorKey: 'variations',
    header: 'Preço',
    cell: ({ row }) => {
      const variations = row.original.variations || [];
      if (variations.length === 0) return "Sem preço";

      const prices = variations.map(v => new Decimal(v.price));
      const min = Decimal.min(...prices);
      const max = Decimal.max(...prices);

      if (min.equals(max)) {
        return `R$ ${min.toFixed(2)}`;
      }
      return `R$ ${min.toFixed(2)} - ${max.toFixed(2)}`;
    },
  },
  {
    id: 'Categoria',
    accessorKey: 'category.name',
    header: 'Categoria',
    cell: (info) => info.row.original.category?.name || "Sem categoria",
  },
  {
    id: 'Tamanho',
    accessorKey: 'variations',
    header: 'Tamanhos',
    cell: ({ row }) => {
      const variations = row.original.variations || [];
      if (variations.length === 0) return "Semariações";
      const sizes = Array.from(new Set(variations.map(v => v.size?.name || "Padrão"))).join(", ");
      return sizes;
    },
  },
  {
    id: 'Disponível?',
    header: 'Disponível?',
    cell: ({ row }) => {
      const variations = row.original.variations || [];
      const isAvailable = variations.some(v => v.is_available);
      return isAvailable ? 'Sim' : 'Não';
    },
  },
  {
    id: 'Editar',
    accessorKey: 'id',
    header: 'Editar',
    cell: ({ row }) => {
      return (
        <ButtonIcon modalName={"edit-product-" + row.original.id}
          title={"Editar " + row.original.name}>
          <ProductForm
            item={row.original}
            isUpdate={true} />
        </ButtonIcon>
      )
    },
  },
];

export default ProductColumns