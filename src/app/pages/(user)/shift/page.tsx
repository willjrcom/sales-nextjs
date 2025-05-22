import ShiftDashboard from "./shift"
import PageTitle from '@/app/components/PageTitle';

const PageShift = () => {
    return (
        <>
            <PageTitle title="Turno" tooltip="Painel do turno atual, exibindo vendas, cancelamentos e status." />
            <ShiftDashboard />
        </>
    )
}

export default PageShift