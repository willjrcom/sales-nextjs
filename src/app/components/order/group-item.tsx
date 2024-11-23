import ItemOrder from "./item"

interface GroupItemOrderProps {
    items: {name: string, quantity: number}[]
}

const GroupItemOrder = ({items}: GroupItemOrderProps) => {
    return (
        <div className="p-4 border rounded-lg bg-gray-50 min-w-[200px]">
            {items.map((item, index) => (
                <ItemOrder key={index} quantity={item.quantity} name={item.name} />
            ))}
        </div>
    )
}

export default GroupItemOrder