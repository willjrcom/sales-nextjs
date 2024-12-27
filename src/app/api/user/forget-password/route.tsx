import RequestApi from "../../request";

interface ForgetUserPasswordProps {
    email: string
}
const ForgetUserPassword = async (email: string): Promise<string> => {
    const body = {email: email} as ForgetUserPasswordProps
    const response = await RequestApi<ForgetUserPasswordProps,string>({
        path: "/user/forget-password", 
        method: "PATCH",
        body: body,
    });
    return response.data
};

export default ForgetUserPassword