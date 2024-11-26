interface ErrorFormsProps {
    errors: Record<string, string[]>
}

export default function ErrorForms({ errors }: ErrorFormsProps) {
    return (
        <>
        {Object.entries(errors).map(([field, messages]) =>
            messages.map((message, index) => (
                <p key={`${field}-${index}`} className="text-red-500">
                    {message}
                </p>
            ))
        )}
        </>
    )
}