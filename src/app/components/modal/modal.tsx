import React from 'react';
import styles from "./form.module.css";

interface ModalProps {
    title: string;
    show: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl'; // Suporte para tamanhos diferentes
    onClose?: () => void; // Suporte para fechar modal
    children: React.ReactNode;
}

const Modal = ({ title, show, size = 'sm', onClose, children }: ModalProps) => {
    if (!show) return null;

    const sizeClasses = {
        sm: 'max-w-[25vw]',
        md: 'max-w-[35vw]',
        lg: 'max-w-[50vw]',
        xl: 'max-w-[80vw]',
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20"
        >
            <div className={`${styles.modalContent} w-full ${sizeClasses[size]} mx-4 bg-white rounded-lg shadow-lg`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">{title}</h2>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                &#10005;
                            </button>
                        )}
                    </div>
                    <hr className="my-4" />
                    <div>{children}</div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
