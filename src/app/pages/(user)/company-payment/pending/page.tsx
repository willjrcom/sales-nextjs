"use client";

import PaymentStatusScreen from "@/app/components/company-payment/payment-status";

const CompanyPaymentPendingPage = () => (
  <PaymentStatusScreen
    status="pending"
    title="Pagamento em análise"
    description="O Mercado Pago ainda está processando o pagamento. Assim que for aprovado, atualizaremos automaticamente."
  />
);

export default CompanyPaymentPendingPage;
