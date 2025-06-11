import { notifyError } from "@/app/utils/notifications"

interface ErrorFormsProps {
    errors: Record<string, string[]>
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
}

export default function ErrorForms({ errors, setErrors }: ErrorFormsProps) {
    if (Object.keys(errors).length === 0) return <></>

    Object.entries(errors).map(([field, messages]) =>
        messages.forEach((message) => notifyError(`${field}: ${message}`))
    )

    setErrors({})
    
    return <></>
}