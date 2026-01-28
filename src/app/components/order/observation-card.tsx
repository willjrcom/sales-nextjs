const ObservationCard = ({ observation }: { observation: string }) => {
    return (
        <p className="text-sm italic text-gray-600 bg-red-50 p-3 rounded">
            <strong className="text-red-600">OBS: </strong>{observation}
        </p>
    );
};

export default ObservationCard;