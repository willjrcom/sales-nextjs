interface RemovedItemsProps {
    item: string;
}

const RemovedItem = ({ item }: RemovedItemsProps) => {
    return (
        <span className="px-2 py-1 text-sm rounded-lg bg-red-500 text-white">
            {item}
        </span>
    )
}

export default RemovedItem