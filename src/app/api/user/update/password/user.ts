import RequestApi from "../../../request";

interface UpdateUserProps {
    email: string;
    password: string;
}

const UpdateUserPassword = async (body: UpdateUserProps): Promise<string> => {
    const response = await RequestApi<UpdateUserProps, string>({
        path: "/user/update/password",
        method: "PATCH",
        body: body,
    });
    return response.data
};

export default UpdateUserPassword