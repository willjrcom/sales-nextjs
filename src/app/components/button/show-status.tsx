import { getStatusColor, showStatus } from "@/app/utils/status";

interface StatusComponentProps {
    status: string;
}

const StatusComponent = ({ status }: StatusComponentProps) => (
    <span className={`ml-2 px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor[status]}`}>
    {showStatus[status]}
  </span>
)

export default StatusComponent