import React from 'react';
import styles from "./form.module.css";

interface ModalProps {
    title: string;
    show: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl'; // Suporte para tamanhos diferentes
    onClose?: () => void; // Suporte para fechar modal
    withoutBackground?: boolean;
    children: React.ReactNode;
}



const Modal = ({ title, show, size = 'md', onClose, withoutBackground, children }: ModalProps) => {
    if (!show) return null;

    const sizeClasses = {
        sm: 'max-w-[25vw] h-auto',
        md: 'max-w-[50vw] h-auto',
        lg: 'max-w-[75vw] h-[75vh]',
        xl: 'max-w-[90vw] h-[90vh]',
    };

    const backgroundClasses = withoutBackground ? "" : "fixed inset-0  bg-black bg-opacity-50"

    return (
        <>
            {/* Modal background */}
            <div className={backgroundClasses + " flex items-center justify-center"} style={{ zIndex: 1000 }}>

                {/* Modal */}
                <div
                    className={`${styles.modalContent} w-full ${sizeClasses[size]} bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-1">
                        {/* Cabeçalho do Modal */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-md font-bold">{title}</h2>
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

                        {/* Conteúdo */}
                        <div>{children}</div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Modal;
