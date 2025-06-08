import { notifyError } from "@/app/utils/notifications"

interface ErrorFormsProps {
    errors: Record<string, string[]>
}

export default function ErrorForms({ errors }: ErrorFormsProps) {
    if (Object.keys(errors).length === 0) return <></>

    Object.entries(errors).map(([field, messages]) =>
        messages.forEach((message) => notifyError(`${field}: ${message}`))
    )

    return <></>
}