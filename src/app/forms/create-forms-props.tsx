interface CreateFormsProps<T> {
    item?: T
    setItem?: (item: T) => void
    isUpdate?: boolean
    onSuccess?: () => void
}

export default CreateFormsProps