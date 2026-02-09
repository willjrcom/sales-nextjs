import { useRouter } from "next/navigation";

export default function AccessDenied({ message = "Você não tem permissão para acessar esta página." }: { message?: string }) {
    const router = useRouter();
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-4">
            <h1 className="text-2xl font-bold text-red-500">Acesso Negado</h1>
            <p className="text-gray-600">{message}</p>
            <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                Voltar
            </button>
        </div>
    );
}
