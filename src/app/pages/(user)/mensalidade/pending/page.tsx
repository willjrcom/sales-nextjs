"use client";

import PaymentStatusScreen from "@/app/components/mensalidade/payment-status";

const MensalidadePendingPage = () => (
  <PaymentStatusScreen
    status="pending"
    title="Pagamento em análise"
    description="O Mercado Pago ainda está processando o pagamento. Assim que for aprovado, atualizaremos automaticamente."
  />
);

export default MensalidadePendingPage;
