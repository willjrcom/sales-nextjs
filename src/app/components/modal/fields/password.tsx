import { useState } from "react";
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineCheck, HiOutlineX } from "react-icons/hi";

interface TextFieldProps {
    friendlyName?: string;
    name: string;
    placeholder?: string;
    disabled?: boolean;
    value: string;
    setValue: (value: string) => void;
    pattern?: string;
    optional?: boolean;
    showStrengthIndicator?: boolean;
}

const InputClassName = "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"

// Função para calcular a força da senha
const calculatePasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /\d/.test(password),
        symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    score += checks.length ? 1 : 0;
    score += checks.lowercase ? 1 : 0;
    score += checks.uppercase ? 1 : 0;
    score += checks.numbers ? 1 : 0;
    score += checks.symbols ? 1 : 0;

    return { score, checks };
};

const PasswordField = ({ 
    friendlyName, 
    name, 
    placeholder, 
    disabled, 
    value, 
    setValue, 
    pattern, 
    optional,
    showStrengthIndicator = false
}: TextFieldProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const { score, checks } = calculatePasswordStrength(value);

    const getStrengthColor = () => {
        if (score <= 2) return 'bg-red-500';
        if (score <= 3) return 'bg-yellow-500';
        if (score <= 4) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getStrengthText = () => {
        if (score <= 2) return 'Fraca';
        if (score <= 3) return 'Média';
        if (score <= 4) return 'Boa';
        return 'Forte';
    };

    return (
        <div className="mb-4">
            {friendlyName && (
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={friendlyName}>
                    {friendlyName} {!optional && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative">
                <input
                    className={InputClassName}
                    id={name}
                    type={showPassword ? "text" : "password"}
                    placeholder={placeholder}
                    disabled={disabled}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    pattern={pattern}
                />
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? (
                        <HiOutlineEyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                        <HiOutlineEye className="h-5 w-5 text-gray-400" />
                    )}
                </button>
            </div>

            {showStrengthIndicator && (
                <div className="mt-2">
                    {/* Barra de força da senha */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                                style={{ width: `${(score / 5) * 100}%` }}
                            ></div>
                        </div>
                        <span className={`text-xs font-medium ${
                            score <= 2 ? 'text-red-600' : 
                            score <= 3 ? 'text-yellow-600' : 
                            score <= 4 ? 'text-blue-600' : 'text-green-600'
                        }`}>
                            {getStrengthText()}
                        </span>
                    </div>

                    {/* Critérios de validação */}
                    <div className="grid grid-cols-1 gap-1 text-xs">
                        <div className={`flex items-center gap-1 ${checks.length ? 'text-green-600' : 'text-gray-400'}`}>
                            {checks.length ? <HiOutlineCheck size={12} /> : <HiOutlineX size={12} />}
                            Pelo menos 8 caracteres
                        </div>
                        <div className={`flex items-center gap-1 ${checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                            {checks.lowercase ? <HiOutlineCheck size={12} /> : <HiOutlineX size={12} />}
                            Letra minúscula
                        </div>
                        <div className={`flex items-center gap-1 ${checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                            {checks.uppercase ? <HiOutlineCheck size={12} /> : <HiOutlineX size={12} />}
                            Letra maiúscula
                        </div>
                        <div className={`flex items-center gap-1 ${checks.numbers ? 'text-green-600' : 'text-gray-400'}`}>
                            {checks.numbers ? <HiOutlineCheck size={12} /> : <HiOutlineX size={12} />}
                            Número
                        </div>
                        <div className={`flex items-center gap-1 ${checks.symbols ? 'text-green-600' : 'text-gray-400'}`}>
                            {checks.symbols ? <HiOutlineCheck size={12} /> : <HiOutlineX size={12} />}
                            Caractere especial
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PasswordField;