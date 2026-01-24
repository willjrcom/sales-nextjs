import { Session } from "next-auth";
import RefreshAccessToken from "../../user/refresh-access-token/user";

export default async function jwt({ token, user, trigger, session }: any) {
    // Handle session updates (e.g., setting access_token via session.update)
    if (trigger === "update") {
        if (session.user.access_token) {
            token.access_token = session.user.access_token;
            // Decodifica o novo access_token para atualizar a expiração
            const decoded = decodeJwt(session.user.access_token);
            if (decoded.exp) token.accessTokenExpires = decoded.exp; // Use custom field
        }
        // Retorna direto após update, sem verificar expiração
        return token;
    }

    // Initial sign in: store the access token (access_token) on the token object
    if (user) {
        token.email = user.email;
        token.sub = user.id;
        token.access_token = user.id;
        // decode expiration from the access_token
        const decoded = decodeJwt(token.access_token as string);
        if (decoded.exp) token.accessTokenExpires = decoded.exp; // Use custom field
        // Retorna direto no login inicial, sem verificar expiração
        return token;
    }

    // Se já teve erro ao fazer refresh, força logout
    if (token.error === 'RefreshAccessTokenError') {
        return token;
    }

    // If token has sufficient time remaining, return it
    const now = Math.floor(Date.now() / 1000);

    // Token backend válido por 2h, fazemos refresh 60min antes de expirar
    const refreshBuffer = 60 * 60; // 60 minutos

    // Use accessTokenExpires instead of exp (which NextAuth overwrites)
    const backendExp = token.accessTokenExpires as number;

    const backendExpiration = new Date(backendExp * 1000);
    const sessionExpiration = new Date((backendExp - refreshBuffer) * 1000)

    console.log(`[NextAuth JWT] Debug Info:`);
    console.log("Backend Expiration (accessTokenExpires): " + backendExpiration.toLocaleString());
    console.log("Refresh Trigger Time: " + sessionExpiration.toLocaleString());
    console.log("Is Valid (No Refresh Needed): " + (now < backendExp - refreshBuffer));

    // Check if the current time is past the 'trigger time'
    if (now < backendExp - refreshBuffer) {
        console.log('[NextAuth JWT] Token is valid. Returning.');
        return token;
    }

    console.log('[NextAuth JWT] Token expired or buffer reached. Refreshing...');
    // Token expired or about to expire, refresh it
    return await refreshAccessToken(token);
}


async function refreshAccessToken(token: any) {
    try {
        // Construct a fake session to reuse RefreshAccessToken helper
        const session = { user: { access_token: token.access_token } } as Session;
        const newToken = await RefreshAccessToken(session);
        const decoded = decodeJwt(newToken);
        return {
            ...token,
            access_token: newToken,
            accessTokenExpires: decoded.exp, // Update custom field
            // Note: We leave token.exp alone or let NextAuth handle it
        };
    } catch (error) {
        console.error('Error refreshing access token', error);
        return {
            ...token,
            error: 'RefreshAccessTokenError',
        };
    }
}

/**
 * Helper to decode a JWT and return its payload
 */
function decodeJwt(jwt: string) {
    try {
        const payload = jwt.split('.')[1];
        const decoded = Buffer.from(payload, 'base64').toString();
        return JSON.parse(decoded);
    } catch {
        return {};
    }
}