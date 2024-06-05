import { useState } from "react";

interface ModalProps {
    showModal: boolean
    setShowModal: (value: boolean) => void

}

const ModalHandler = (): ModalProps => {
    const [showModal, setShowModal] = useState(false);

    return {
        showModal,
        setShowModal
    }
}

export default ModalHandler