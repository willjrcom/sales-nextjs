import RequestApi, { AddAccessToken } from "../request";
import { Session } from "next-auth";

interface UploadResponse {
    key: string;
    public_url: string;
}

const sanitizeFileName = (filename: string): string => {
    const trimmed = filename.trim();
    const lastDotIndex = trimmed.lastIndexOf(".");
    const hasExtension = lastDotIndex > 0 && lastDotIndex < trimmed.length - 1;

    const base = hasExtension ? trimmed.slice(0, lastDotIndex) : trimmed;
    const extension = hasExtension ? trimmed.slice(lastDotIndex + 1) : "";

    const normalizedBase = base
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // keep only safe chars
        .replace(/^-+|-+$/g, "") // trim hyphens
        .replace(/-{2,}/g, "-"); // collapse

    const safeBase = normalizedBase || "image";
    const safeExtension = extension
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "");

    return safeExtension ? `${safeBase}.${safeExtension}` : safeBase;
};

const UploadImage = async (file: File, session: Session): Promise<UploadResponse> => {
    const normalizedName = sanitizeFileName(file.name);
    const normalizedFile = new File([file], normalizedName, {
        type: file.type,
        lastModified: file.lastModified,
    });

    const formData = new FormData();
    formData.append("image", normalizedFile);

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