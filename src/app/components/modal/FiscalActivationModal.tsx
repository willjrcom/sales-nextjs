"use client";

import { useState } from "react";

interface FiscalActivationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

const FiscalActivationModal = ({
    isOpen,
    onClose,
    onConfirm,
}: FiscalActivationModalProps) => {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            // Error handling is done in parent component
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">⚠️</span>
                        <h2 className="text-2xl font-bold text-white">
                            Ativar Emissão de Notas Fiscais?
                        </h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-gray-700 font-medium">
                        Ao ativar, você concorda com os seguintes termos:
                    </p>

                    {/* Pricing */}
                    <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">💰</span>
                            <div>
                                <p className="font-semibold text-gray-800">
                                    Taxa Mensal: R$ 20,00
                                </p>
                                <p className="text-sm text-gray-600">
                                    Cobrada mensalmente enquanto o serviço estiver ativo
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="text-2xl">📄</span>
                            <div>
                                <p className="font-semibold text-gray-800">
                                    Taxa por Nota: R$ 0,10
                                </p>
                                <p className="text-sm text-gray-600">
                                    Cobrada a cada NFC-e emitida
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Cancellation Policy */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="font-semibold text-amber-800">
                                    Política de Cancelamento
                                </p>
                                <p className="text-sm text-amber-700 mt-1">
                                    Se você desativar o serviço, a cobrança continuará até o fim
                                    do mês atual. O cancelamento só terá efeito a partir do
                                    próximo mês.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 font-medium shadow-md"
                    >
                        {loading ? "Ativando..." : "Confirmar e Ativar"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FiscalActivationModal;
