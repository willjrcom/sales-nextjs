import RequestApi from "../../request";

interface LoginProps {
    email: string;
    password: string;
}

const Login = async (credencials: LoginProps): Promise<any> => {
    const response = await RequestApi<LoginProps, any>({
        path: "/user/login",
        method: "POST",
        body: credencials,
    });
    return response.data
};

export default Login