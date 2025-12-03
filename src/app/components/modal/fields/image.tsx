import React, { useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import UploadImage from '@/app/api/s3/uploadImage';

interface ImageFieldProps {
    friendlyName?: string;
    name: string;
    disabled?: boolean;
    value: string;
    setValue: (value: string) => void;
    optional?: boolean;
    /** Callback fired when upload starts */
    onUploadStart?: () => void;
    /** Callback fired when upload completes */
    onUploadComplete?: (url: string) => void;
    /** Callback fired when upload fails */
    onUploadError?: (error: string) => void;
}

const ImageField = ({ 
    friendlyName, 
    name, 
    disabled, 
    value, 
    setValue, 
    optional,
    onUploadStart,
    onUploadComplete,
    onUploadError
}: ImageFieldProps) => {
    const [uploading, setUploading] = useState<boolean>(false);
    const [imgError, setImgError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { data: session } = useSession();

    const emitError = (message: string) => {
        setErrorMessage(message);
        onUploadError?.(message);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setErrorMessage(null);
        setImgError(false);

        if (!session) {
            emitError('Sessão não encontrada. Faça login novamente.');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            emitError('Por favor, selecione apenas arquivos de imagem (JPG, PNG, GIF, etc.)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            emitError('A imagem deve ter no máximo 5MB');
            return;
        }

        // Validate file name
        if (!file.name || file.name.trim() === '') {
            emitError('Nome do arquivo inválido');
            return;
        }

        setUploading(true);
        onUploadStart?.();

        try {
            // Pegue o schema_name da sessão se necessário
            const { public_url } = await UploadImage(file, session);

            setValue(public_url);
            setImgError(false);
            setErrorMessage(null);
            onUploadComplete?.(public_url);
        } catch (error: any) {
            console.error('Error uploading image:', error);
            
            let formattedError = 'Erro ao enviar imagem';
            
            // Handle specific error cases
            if (error.name === 'NetworkError' || error.message?.includes('Failed to fetch')) {
                formattedError = 'Erro de conexão. Verifique sua internet e tente novamente.';
            } else if (error.name === 'AccessDenied') {
                formattedError = 'Acesso negado. Verifique as configurações do S3.';
            } else if (error.message) {
                formattedError = error.message;
            }
            
            emitError(formattedError);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setValue('');
        setImgError(false);
        setErrorMessage(null);
    };

    return (
        <div className="mb-4">
            {friendlyName && (
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
                    {friendlyName} {!optional && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="space-y-3">
                {/* File Input */}
                <div className="flex items-center space-x-2">
                    <input
                        type="file"
                        id={name}
                        name={name}
                        accept="image/*"
                        disabled={disabled || uploading}
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                {/* Upload Status */}
                {uploading && (
                    <div className="flex items-center space-x-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">Enviando imagem...</span>
                    </div>
                )}

                {/* Image Preview */}
                {value && !imgError && (
                    <div className="relative inline-block">
                        <Image
                            src={value}
                            alt="Preview da imagem"
                            width={128}
                            height={128}
                            className="max-h-32 max-w-full rounded-lg border border-gray-300 shadow-sm"
                            onError={() => {
                                setImgError(true);
                                emitError('Erro ao carregar a imagem. Verifique se a URL está correta.');
                            }}
                        />
                        {!disabled && (
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                title="Remover imagem"
                            >
                                ×
                            </button>
                        )}
                    </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                    <div className="text-sm text-red-600" role="alert">
                        {errorMessage}
                    </div>
                )}

                {/* Help Text */}
                <p className="text-xs text-gray-500">
                    Formatos aceitos: JPG, PNG, GIF, WebP. Tamanho máximo: 5MB
                </p>
            </div>
        </div>
    );
};

export default ImageField; 