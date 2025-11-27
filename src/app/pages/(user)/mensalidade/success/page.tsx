"use client";

import PaymentStatusScreen from "@/app/components/mensalidade/payment-status";

const MensalidadeSuccessPage = () => (
  <PaymentStatusScreen
    status="success"
    title="Pagamento confirmado!"
    description="Recebemos a confirmação do Mercado Pago. Seu plano será atualizado em instantes."
  />
);

export default MensalidadeSuccessPage;
