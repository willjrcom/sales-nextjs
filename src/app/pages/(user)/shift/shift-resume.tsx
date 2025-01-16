import Shift from "@/app/entities/shift/shift";

interface ShiftResumeProps {
    shift: Shift;
}

const ShiftResume = ({ shift }: ShiftResumeProps) => {
    return (
        <div className="bg-white p-4 shadow-md rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Resumo do Turno</h3>
            <div className="w-full bg-gray-200 rounded-lg h-64 mb-4">
                <div className="flex items-center justify-center h-full">[Gráfico de Vendas]</div>
            </div>
        </div>
    )
}

export default ShiftResume