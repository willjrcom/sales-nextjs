import { Session } from "next-auth";
import RequestApi, { AddIdToken } from "../../request";
import User from "@/app/entities/user/user";

interface SearchUserProps {
    cpf: string;
}
const SearchUser = async (search: SearchUserProps, session: Session): Promise<User> => {
    const response = await RequestApi<SearchUserProps, User>({
        path: "/user/search",
        method: "POST",
        body: search,
        headers: await AddIdToken(session),
    });
    return response.data
};

export default SearchUser