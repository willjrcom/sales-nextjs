
export const addressTypes = [
    'house',
    'apartment',
    'condominium',
    'work',
    'hotel',
    'shed'
] as const;

export const AddressTypesWithId: { id: string; name: string }[] = Array.from(addressTypes, (type) => ({
    id: type,
    name: translateToPortuguese(type),
}));

export const addressUFs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
    'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

export const addressUFsWithId: { id: string; name: string }[] = Array.from(addressUFs, (uf) => ({
    id: uf,
    name: uf,
}));

function translateToPortuguese(type: string): string {
    const translations: Record<string, string> = {
        house: 'Casa',
        apartment: 'Apartamento',
        condominium: 'Condomínio',
        work: 'Trabalho',
        hotel: 'Hotel',
        shed: 'Galpão',
    };
    return translations[type] || type;
}
