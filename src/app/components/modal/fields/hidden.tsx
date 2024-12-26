import { Dispatch, SetStateAction } from "react";

interface HiddenFieldProps {
    name: string
    value?: string
    setValue: Dispatch<SetStateAction<string>>
    optional?: boolean;
}

const HiddenField = ({ name, value, setValue }: HiddenFieldProps) => {
    return (
        <input type='hidden' id={name} name={name} value={value} onChange={e => setValue(e.target.value)}></input>
    )
}

export default HiddenField