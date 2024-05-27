import Link from "next/link";

interface ModalProps {
    title: string;
    show: boolean;
    onClose: () => void;
    children: React.ReactNode;
    createHref: string;
}

const Form = ({ title, show, onClose, children, createHref }: ModalProps) => {
    if (!show) return null;

    return (
        <div className="max-w-md mx-auto mt-10">
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <h1>{title}</h1>
                {children}

                <div className="flex items-center justify-between">
                    <Link href={createHref}>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="button">Criar</button>
                    </Link>

                    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={onClose}>Cancelar</button>
                </div>
            </form>
        </div>
    );
}

export default Form