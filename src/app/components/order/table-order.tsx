import { showStatus } from "@/app/utils/status";
import ButtonIcon from "../crud/button-icon";
import Order from "@/app/entities/order/order";

interface OrderProps {
    order: Order | null;
}

const TableCard = ({ order }: OrderProps) => {
    const table = order?.table;
    console.log(table)
    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div className="flex justify-between items-center">
                <h2 className="font-bold mb-2">Mesa</h2>
                <ButtonIcon modalName={"edit-table-" + order?.table?.name} title="Editar nome" size="md">
                    <h1>Editar nome</h1>
                </ButtonIcon>
            </div>

            <p>{table?.name}</p>
            {table?.status && <p>Status: {showStatus(table?.status)}</p>}
        </div>
    )
}

export default TableCard