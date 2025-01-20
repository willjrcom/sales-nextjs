import RequestApi from "../../request";

interface AccessProps {
    schema: string;
}

const Access = async (credencials: AccessProps, headers: any): Promise<string> => {
    const response = await RequestApi<AccessProps, string>({
        path: "/user/access",
        method: "POST",
        body: credencials,
        headers: headers,
    });
    return response.data
};

export default Access