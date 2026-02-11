'use client';

import PageTitle from '@/app/components/ui/page-title';
import ThreeColumnHeader from '@/components/header/three-column-header';

export default function PageError() {
    return (
        <ThreeColumnHeader
            center={<PageTitle title="Falha ao carregar página" tooltip="Ocorreu um erro ao carregar este conteúdo. Tente atualizar a página." />} />
    );
}