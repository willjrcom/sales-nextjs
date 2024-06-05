import { Session } from "next-auth"

interface CreateFormsProps<T> {
    item?: T
    onSubmit: (entity: T, session: Session) => Promise<string>
    handleCloseModal: () => void
    reloadData: () => void
}

export default CreateFormsProps