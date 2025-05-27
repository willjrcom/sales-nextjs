import RequestApi from "../../request";
import User from "@/app/entities/user/user";

interface LoginProps {
    email: string;
    password: string;
}

interface LoginResponse {
    user: User;
    id_token: string;
}

const Login = async (credencials: LoginProps): Promise<LoginResponse> => {
    const response = await RequestApi<LoginProps, LoginResponse>({
        path: "/user/login",
        method: "POST",
        body: credencials,
        isLogin: true
    });
    return response.data
};

export default Login