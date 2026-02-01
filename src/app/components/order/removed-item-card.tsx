import { Badge } from "@/components/ui/badge"

interface RemovedItemsProps {
    item: string;
}

const RemovedItemCard = ({ item }: RemovedItemsProps) => {
    return (
        <div className="px-2 py-1">
            <Badge variant="destructive">
                {item}
            </Badge>
        </div>
    )
}

export default RemovedItemCard