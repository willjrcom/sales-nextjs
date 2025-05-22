'use client';

import PageTitle from '@/app/components/PageTitle';

export default function PageError() {
    return (
        <div>
            <PageTitle title="Falha ao carregar página" tooltip="Ocorreu um erro ao carregar este conteúdo. Tente atualizar a página." />
        </div>
    );
}