import RequestApi from "../../request";

interface LoginProps {
    email: string;
    password: string;
}

interface LoginResponse {
    access_token: string;
    companies: [];
}

const Login = async (credencials: LoginProps): Promise<LoginResponse> => {
    const response = await RequestApi<LoginProps, any>({
        path: "/user/login",
        method: "POST",
        body: credencials,
    });
    return response.data
};

export default Login