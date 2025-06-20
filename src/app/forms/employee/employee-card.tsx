import React from "react";
import Employee from "@/app/entities/employee/employee";
import Contact from "@/app/entities/contact/contact";
import Address from "@/app/entities/address/address";
import { HiOutlineUser, HiOutlinePhone, HiOutlineHome, HiOutlineIdentification, HiOutlineMail, HiOutlineCalendar } from "react-icons/hi";

interface EmployeeCardProps {
    item: Employee;
}

function formatDate(dateString?: string) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: '2-digit' });
}

function EmployeeCard({ item }: EmployeeCardProps) {
    const contact = item.contact as Contact;
    const address = item.address as Address;

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 mx-auto flex flex-col gap-6">
            <div className="flex items-center gap-4 border-b pb-4">
                <div className="bg-blue-100 text-blue-600 rounded-full p-3">
                    <HiOutlineUser size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{item.name}</h2>
                    <div className="flex items-center gap-2 mt-1 text-gray-500">
                        <HiOutlineIdentification size={18} />
                        <span className="text-sm font-medium">CPF: {item.cpf}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-gray-500">
                        <HiOutlineMail size={18} />
                        <span className="text-sm font-medium">{item.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-gray-500">
                        <HiOutlineCalendar size={18} />
                        <span className="text-sm font-medium">Nascimento: {formatDate(item.birthday)}</span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <span className="text-gray-400 uppercase text-xs font-semibold tracking-wider">Contato</span>
                    <div className="flex items-center gap-2 text-gray-700">
                        <HiOutlinePhone size={20} className="text-blue-500" />
                        <span>{contact ? `(${contact.ddd}) ${contact.number}` : '-'}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-gray-400 uppercase text-xs font-semibold tracking-wider">Endereço</span>
                    <div className="flex items-start gap-2 text-gray-700">
                        <HiOutlineHome size={20} className="text-blue-500 mt-0.5" />
                        <div className="flex flex-col text-sm">
                            <span>{address ? `${address.street}, ${address.number}` : '-'}</span>
                            {address && (
                                <>
                                    <span>{address.neighborhood}</span>
                                    <span>{address.city} - CEP: {address.cep}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmployeeCard; 