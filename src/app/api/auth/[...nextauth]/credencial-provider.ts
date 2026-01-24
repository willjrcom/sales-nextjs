import CredentialsProvider from "next-auth/providers/credentials";
import Login from "../../user/login/login";

export default CredentialsProvider({
    name: "Credentials",
    credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember: { label: "Lembrar conexão", type: "boolean" },
    },
    async authorize(credentials) {
        const email = credentials?.email || "";
        const password = credentials?.password || "";
        try {

            const response = await Login({ email, password });

            if (response?.id_token) {
                return {
                    id: response.id_token,
                    name: response.user.name || email,
                    email,
                };
            }

            throw new Error("Credenciais inválidas");
        } catch (error) {
            console.error("Erro na autenticação:", error);

            // Extrai mensagem de erro mais amigável para o usuário
            let errorMessage = "Erro desconhecido";

            if (error && typeof error === 'object' && 'message' in error) {
                const message = (error as { message?: string }).message || '';

                // Verifica se é erro de coluna inexistente no banco
                if (message.includes('column u.image_path does not exist')) {
                    errorMessage = "Erro no banco de dados: campo de imagem não encontrado. Entre em contato com o suporte.";
                } else if (message.includes('SQLSTATE')) {
                    errorMessage = "Erro no banco de dados. Entre em contato com o suporte.";
                } else {
                    errorMessage = message;
                }
            }

            throw new Error(errorMessage);
        }
    },
})