'use client';

import GetCompany from "@/app/api/company/company";

import React, { useMemo, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import QRCode from 'react-qr-code';
import { TextField, CheckboxField } from '../../components/modal/field';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import Table, { SchemaTable } from '@/app/entities/table/table';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteTable from '@/app/api/table/delete/table';
import NewTable from '@/app/api/table/new/table';
import UpdateTable from '@/app/api/table/update/table';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const TableForm = ({ item, isUpdate }: CreateFormsProps<Table>) => {
    const modalName = isUpdate ? 'edit-table-' + item?.id : 'new-table'
    const modalHandler = useModal();
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    const [isSaving, setIsSaving] = useState(false);

    const initialValues = useMemo(() => {
        const t = new Table(item);
        return {
            id: t.id,
            name: t.name,
            is_active: t.is_active,
            is_available: t.is_available,
        }
    }, [item]);

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<any>({
        resolver: zodResolver(SchemaTable),
        defaultValues: initialValues
    });

    const table = watch();

    const onInvalid = () => {
        console.log(errors);
        notifyError('Verifique os campos obrigatórios');
    };

    const createMutation = useMutation({
        mutationFn: (newTable: Table) => NewTable(newTable, session!),
        onSuccess: (_, newTable) => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            queryClient.invalidateQueries({ queryKey: ['unused-tables'] });
            notifySuccess(`Mesa ${newTable.name} criada com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao criar mesa');
        },
        onSettled: () => setIsSaving(false)
    });

    const updateMutation = useMutation({
        mutationFn: (updatedTable: Table) => UpdateTable(updatedTable, session!),
        onSuccess: (_, updatedTable) => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            queryClient.invalidateQueries({ queryKey: ['unused-tables'] });
            notifySuccess(`Mesa ${updatedTable.name} atualizada com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao atualizar mesa');
        },
        onSettled: () => setIsSaving(false)
    });

    const deleteMutation = useMutation({
        mutationFn: (tableId: string) => DeleteTable(tableId, session!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            queryClient.invalidateQueries({ queryKey: ['unused-tables'] });
            notifySuccess(`Mesa ${table.name} removido com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || `Erro ao remover mesa ${table.name}`);
        },
        onSettled: () => setIsSaving(false)
    });

    const submit = async (formData: any) => {
        if (!session) return;
        setIsSaving(true);
        const tableToSave = new Table(formData);
        if (isUpdate) {
            updateMutation.mutate(tableToSave);
        } else {
            createMutation.mutate(tableToSave);
        }
    }

    const onDelete = async () => {
        if (!session || !table.id) return;
        setIsSaving(true);
        deleteMutation.mutate(table.id);
    }

    const { data: company } = useQuery({
        queryKey: ["company"],
        queryFn: () => GetCompany(session!),
        enabled: !!session?.user?.access_token,
    })

    const qrCodeRef = useRef<HTMLDivElement>(null);

    // Generate table URL for QR code
    const encodedSchemaName = company ? btoa(company.schema_name) : '';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    const tableUrl = table.id && company && appUrl
        ? `${appUrl}/pages/table?id=${table.id}&q=${encodedSchemaName}`
        : '';

    // Download QR code as PNG
    const downloadQRCode = () => {
        if (!qrCodeRef.current) return;

        const svg = qrCodeRef.current.querySelector('svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        const padding = 40;
        const qrSize = 200;
        const textHeight = 40;
        canvas.width = qrSize + padding * 2;
        canvas.height = qrSize + padding * 2 + textHeight;

        img.onload = () => {
            if (!ctx) return;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, padding, padding, qrSize, qrSize);
            ctx.font = 'bold 20px Inter, sans-serif';
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            if (table.name.toLowerCase().includes('mesa'))
                ctx.fillText(`${table.name}`, canvas.width / 2, qrSize + padding + 30);
            else {
                ctx.fillText(`Mesa: ${table.name}`, canvas.width / 2, qrSize + padding + 30);
            }

            canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `mesa-${table.name}-qrcode.png`;
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
            });
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    if (!company) return <div>Carregando...</div>;
    if (!appUrl) return <div>Url do app não configurada</div>

    return (
        <div className="text-black space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Informações da Mesa</h3>
                    <div className="space-y-4">
                        <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField friendlyName='Nome' name='name' setValue={(value: any) => setValue('name', value)} value={table.name} error={errors.name?.message as string} />
                        </div>
                        <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                            <CheckboxField friendlyName='Disponível' name='is_available' setValue={(value: any) => setValue('is_available', value)} value={table.is_available} error={errors.is_available?.message as string} />
                        </div>
                        {isUpdate && (
                            <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                                <CheckboxField friendlyName='Ativo' name='is_active' setValue={(value: any) => setValue('is_active', value)} value={table.is_active} error={errors.is_active?.message as string} />
                            </div>
                        )}
                    </div>
                </div>

                {isUpdate && table.id && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg shadow-sm border border-orange-100 p-6 transition-all duration-300 hover:shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-orange-200">QR Code da Mesa</h3>
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div ref={qrCodeRef} className="bg-white p-4 rounded-lg shadow-inner">
                                <QRCode
                                    value={tableUrl}
                                    size={200}
                                    level="H"
                                    fgColor="#000000"
                                />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-700">Mesa: {table.name}</p>
                                <p className="text-xs text-gray-500 mt-1 break-all px-2">{tableUrl}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={downloadQRCode}
                                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded-lg transition-colors font-medium shadow-sm"
                                >
                                    📥 Baixar QR Code
                                </button>
                                <button
                                    type="button"
                                    onClick={() => window.open(tableUrl, '_blank')}
                                    className="text-xs text-orange-600 hover:text-orange-800 underline transition-colors"
                                >
                                    Testar link
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ButtonsModal
                item={table}
                name="Table"
                onSubmit={handleSubmit(submit, onInvalid)}
                deleteItem={onDelete}
                isPending={isSaving}
            />
        </div>
    );
};

export default TableForm;
