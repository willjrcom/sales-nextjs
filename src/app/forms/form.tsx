import Link from "next/link";
import styles from "./form.module.css";

interface ModalProps {
    title: string;
    isUpdate: boolean;
    show: boolean;
    onClose: () => void;
    children: React.ReactNode;
    createHref: string;
}

const Form = ({ title, isUpdate, show, onClose, children, createHref }: ModalProps) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50" onClick={onClose}>
            <div className={`${styles.modalContent} max-w-lg`} onClick={(e) => e.stopPropagation()}>
                <form className=" bg-white shadow-md rounded px-8 pt-6 pb-8">
                    <h1 className="text-center text-2xl font-bold mb-4">{title}</h1>
                    <hr className="mb-4" />
                    {children}

                    <div className="flex items-center justify-between mt-6">
                        <Link href={createHref}>
                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                                {isUpdate ? 'Atualizar' : 'Cadastrar'}
                            </button>
                        </Link>

                        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={onClose}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Form;
