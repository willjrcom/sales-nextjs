import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

interface PresignRequest {
    filename: string;
    content_type: string;
    schema_name?: string;
}

interface PresignResponse {
    url: string;
    key: string;
    public_url: string;
}

const GetPresignedUrl = async (filename: string, contentType: string, session: Session): Promise<PresignResponse> => {
    // Extrair o schema_name da empresa atual da sessão
    const schemaName = "";
    
    const response = await RequestApi<PresignRequest, PresignResponse>({
        path: "/s3/presign",
        method: "POST",
        body: { 
            filename, 
            content_type: contentType,
            schema_name: schemaName 
        },
        headers: await AddAccessToken(session),
    });

    return response.data;
};

export default GetPresignedUrl; 