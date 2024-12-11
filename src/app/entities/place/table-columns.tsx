import { ColumnDef } from "@tanstack/react-table";
import ButtonIcon from "@/app/components/button/button-icon";
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
        <ButtonIcon modalName={"edit-place-" + row.original.id }
        title={"Editar " + row.original.name}>
          <PlaceForm 
            item={row.original}
            isUpdate={true}/>
        </ButtonIcon>
      )
    },
  },
];

export default PlaceColumns