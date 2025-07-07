import RequestApi from "../request";

export interface ValidatePasswordResetTokenRequest {
    token: string;
}

export interface ValidatePasswordResetTokenResponse {
    valid: boolean;
    email?: string;
}

const ValidatePasswordResetToken = async (token: string): Promise<ValidatePasswordResetTokenResponse> => {
    const body = { token } as ValidatePasswordResetTokenRequest;
    const response = await RequestApi<ValidatePasswordResetTokenRequest, ValidatePasswordResetTokenResponse>({
        path: "/user/validate-password-reset-token",
        method: "POST",
        body,
    });
    return response.data;
};

export default ValidatePasswordResetToken; 