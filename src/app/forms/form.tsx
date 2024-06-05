import Link from "next/link";
import styles from "./form.module.css";

interface ModalProps {
    title: string;
    show: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Form = ({ title, show, onClose, children }: ModalProps) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50" onClick={onClose}>
            <div className={`${styles.modalContent} max-w-lg`} onClick={(e) => e.stopPropagation()}>
                <form className=" bg-white shadow-md rounded px-8 pt-6 pb-8">
                    <h1 className="text-center text-2xl font-bold mb-4">{title}</h1>
                    <hr className="mb-4" />
                    {children}
                </form>
            </div>
        </div>
    );
}

export default Form;
