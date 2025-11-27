"use client";

import PaymentStatusScreen from "@/app/components/company-payment/payment-status";

const CompanyPaymentSuccessPage = () => (
  <PaymentStatusScreen
    status="success"
    title="Pagamento confirmado!"
    description="Recebemos a confirmação do Mercado Pago. Seu plano será atualizado em instantes."
  />
);

export default CompanyPaymentSuccessPage;
