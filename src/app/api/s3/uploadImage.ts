import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

const UploadImage = async (file: File, session: Session): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await RequestApi<FormData, { url: string }>({
        path: "/s3/upload",
        method: "POST",
        body: formData,
        headers: await AddAccessToken(session),
        isFormData: true,
    });

    return response.data.url;
};

export default UploadImage; 