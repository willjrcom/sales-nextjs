"use client";

import PaymentStatusScreen from "@/app/components/company-payment/payment-status";

const CompanyPaymentFailurePage = () => (
  <PaymentStatusScreen
    status="failure"
    title="Pagamento não finalizado"
    description="O Mercado Pago sinalizou uma falha. Você pode tentar novamente ou utilizar outro método."
  />
);

export default CompanyPaymentFailurePage;
