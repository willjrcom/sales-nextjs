import React from 'react';

interface RemovedItemCardProps {
    item: string;
}

const RemovedItemCard = ({ item }: RemovedItemCardProps) => {
    return (
        <div className="relative bg-white p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
            {/* Estado padrão */}
            <div className="flex justify-between items-center">
                <div className="flex justify-between items-center space-x-4">
                    <div className="text-sm font-medium">
                        {item}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RemovedItemCard;
