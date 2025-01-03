import GroupItem from "@/app/entities/order/group-item";

interface GroupItemDetailsProps {
    groupItem: GroupItem;
}

const GroupItemDetails = ({ groupItem }: GroupItemDetailsProps) => {
    return (
        <div>
            <h1>Detalhes do Item: {groupItem.id}</h1>
        </div>
    );
};

export default GroupItemDetails;