import { ColumnDef } from "@tanstack/react-table";
import ButtonEdit from "@/app/components/crud/button-edit";
import PlaceForm from "@/app/forms/place/form";
import UpdatePlace from "@/app/api/place/update/route";
import Place from "./place";


const PlaceColumns = (): ColumnDef<Place>[] => [
  {
    id: 'Nome',
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    id: 'Imagem',
    accessorKey: 'image_path',
    header: 'Imagem',
  },
  {
    id: 'Editar',
    accessorKey: 'id',
    header: 'Editar',
    cell: ({ row }) => {
      return (
        <ButtonEdit 
          name={row.original.name}>
          <PlaceForm 
            item={row.original}
            isUpdate={true}/>
        </ButtonEdit>
      )
    },
  },
];

export default PlaceColumns