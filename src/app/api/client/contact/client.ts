import Client from "@/app/entities/client/client";
import { Session } from "next-auth";
import RequestApi, { AddAccessToken } from "../../request";
import Contact from "@/app/entities/contact/contact";

const GetClientByContact = async (contact: string, session: Session): Promise<Client> => {
    const contactObj = new Contact();
    contactObj.number = contact.substring(2);
    contactObj.ddd = contact.substring(0, 2);

    const response = await RequestApi<Contact, Client>({
        path: "/client/by-contact", 
        method: "POST",
        body: contactObj,
        headers: await AddAccessToken(session),
    });
    return response.data
};

export default GetClientByContact