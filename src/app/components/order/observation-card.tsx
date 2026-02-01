import { Badge } from "@/components/ui/badge"

const ObservationCard = ({ observation }: { observation: string }) => {
    return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white">
            {observation}
        </Badge>
    );
};

export default ObservationCard;