import ButtonIcon from "../button/button-icon";
import Order from "@/app/entities/order/order";
import StatusComponent from "../button/show-status";

interface OrderProps {
    order: Order | null;
}

const TableCard = ({ order }: OrderProps) => {
    const table = order?.table;
    
    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div className="flex justify-between items-center">
                <h2 className="font-bold mb-2">Mesa</h2>
                <ButtonIcon modalName={"edit-table-" + order?.table?.name} title="Editar nome" size="md">
                    <h1>Editar nome</h1>
                </ButtonIcon>
            </div>

            <p>{table?.name}</p>
            {table?.status && <p><StatusComponent status={table?.status} /></p>}
        </div>
    )
}

export default TableCard