import Person from "@/app/entities/person/person";
import RequestApi from "../../request";

interface LoginProps {
    email: string;
    password: string;
}

interface LoginResponse {
    person: Person;
    access_token: string;
    companies: [];
}

const Login = async (credencials: LoginProps): Promise<LoginResponse> => {
    const response = await RequestApi<LoginProps, LoginResponse>({
        path: "/user/login",
        method: "POST",
        body: credencials,
    });
    return response.data
};

export default Login