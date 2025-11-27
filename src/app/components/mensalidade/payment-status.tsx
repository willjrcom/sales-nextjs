"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";

type StatusType = "success" | "pending" | "failure";

interface PaymentStatusScreenProps {
  status: StatusType;
  title: string;
  description: string;
}

const statusConfig: Record<StatusType, { icon: JSX.Element; accent: string }> =
  {
    success: {
      icon: <FaCheckCircle className="text-green-500" size={56} />,
      accent: "bg-green-50 border-green-200 text-green-700",
    },
    pending: {
      icon: <FaClock className="text-yellow-500" size={56} />,
      accent: "bg-yellow-50 border-yellow-200 text-yellow-700",
    },
    failure: {
      icon: <FaTimesCircle className="text-red-500" size={56} />,
      accent: "bg-red-50 border-red-200 text-red-700",
    },
  };

const PaymentStatusScreen = ({
  status,
  title,
  description,
}: PaymentStatusScreenProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId =
    searchParams.get("payment_id") ?? searchParams.get("paymentId");
  const mpStatus = searchParams.get("status");
  const config = statusConfig[status];

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="max-w-2xl w-full bg-white shadow-md rounded-xl p-8 space-y-6 text-center">
        <div className="flex justify-center">{config.icon}</div>
        <div>
          <h1 className="text-3xl font-semibold mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>

        <div className={`border rounded-lg p-4 text-left ${config.accent}`}>
          <p className="font-semibold mb-1">Detalhes do retorno</p>
          <p>
            <span className="font-medium">ID do pagamento:</span>{" "}
            {paymentId ?? "Não informado"}
          </p>
          <p>
            <span className="font-medium">Status recebido:</span>{" "}
            {mpStatus ?? status}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link
            href="/pages/mensalidade"
            className="w-full md:w-auto px-6 py-3 rounded-md bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 transition"
          >
            Ir para Mensalidade
          </Link>
          <button
            onClick={() => router.back()}
            className="w-full md:w-auto px-6 py-3 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusScreen;
