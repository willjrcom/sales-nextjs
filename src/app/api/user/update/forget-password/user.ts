import RequestApi from "../../../request";

interface UpdateUserForgetPasswordProps {
    token: string;
    email: string;
    password: string;
}

const UpdateUserForgetPassword = async (body: UpdateUserForgetPasswordProps): Promise<string> => {
    const response = await RequestApi<UpdateUserForgetPasswordProps, string>({
        path: "/user/update/forget-password",
        method: "PATCH",
        body: body,
    });
    return response.data
};

export default UpdateUserForgetPassword