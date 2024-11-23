interface ItemOrderProps {
    quantity: number,
    name: string
}

const ItemOrder = ({quantity, name}: ItemOrderProps) => {
    return (
        <div className="p-2 border rounded-md text-center mb-2">{quantity} x {name}</div>
    )
}

export default ItemOrder