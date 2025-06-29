import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

interface UploadResponse {
    key: string;
    public_url: string;
}

const UploadImage = async (file: File, session: Session): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await RequestApi<FormData, UploadResponse>({
        path: "/s3/upload",
        method: "POST",
        body: formData,
        headers: await AddAccessToken(session),
        isFormData: true,
    });

    return response.data;
};

export default UploadImage; 