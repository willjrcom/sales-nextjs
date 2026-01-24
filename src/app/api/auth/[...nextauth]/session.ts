export default async function session({ session, token }: any) {
    // Transfere o access_token e outras informações do token para a sessão
    session.user = session.user || {};
    if (token.sub) session.user.id = token.sub;
    if (token.access_token) session.user.access_token = token.access_token;

    return session
}