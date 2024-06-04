import RequestApi from "../../request";

interface AccessProps {
    schema: string;
}

const Access = async (credencials: AccessProps): Promise<any> => {
    const response = await RequestApi<AccessProps, any>(
        {
            path: "/user/access",
            method: "POST",
            body: credencials
        });
    return response
};

export default Access