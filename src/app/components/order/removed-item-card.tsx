import { Badge } from "@/components/ui/badge"

interface RemovedItemsProps {
    value: string;
}

const RemovedItemCard = ({ value }: RemovedItemsProps) => {
    return (
        <div className="px-2 py-1 text-sm">
            <Badge variant="destructive">
                {value}
            </Badge>
        </div>
    )
}

export default RemovedItemCard