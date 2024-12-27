import RequestApi from "../../request";
import User from "@/app/entities/user/user";

interface UserWithPassword extends User {
    password: string
}
const NewUser = async (user: User, password: string): Promise<string> => {
    const userWithPassword = {...user, password: password} as UserWithPassword
    
    const response = await RequestApi<UserWithPassword,string>({
        path: "/user/new", 
        method: "POST",
        body: userWithPassword,
    });
    return response.data
};

export default NewUser