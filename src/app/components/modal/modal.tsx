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
        sm: 'max-w-[25vw] h-auto',
        md: 'max-w-[50vw] h-auto',
        lg: 'max-w-[75vw] h-[75vh]',
        xl: 'max-w-[90vw] h-[90vh]',
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
            <div
                className={`${styles.modalContent} w-full ${sizeClasses[size]} bg-white rounded-lg shadow-lg overflow-hidden`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    {/* Cabeçalho do Modal */}
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

                    {/* Conteúdo */}
                    <div>{children}</div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
