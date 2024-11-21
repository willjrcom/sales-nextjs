import { Session } from "next-auth"
import { ItemContextProps } from "../context/props"

interface CreateFormsProps<T> {
    item?: T
    onSubmit: (entity: T, session: Session) => Promise<string>
    handleCloseModal: () => void
    context?: ItemContextProps<T>
}

export default CreateFormsProps