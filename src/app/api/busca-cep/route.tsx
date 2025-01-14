import { RequestExternalApi } from "../request";

interface AddressViaCep {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    estado: string;
    uf: string;
    ibge: string;
    gia: string;
    ddd: string;
    siafi: string;
}

const GetAddressByCEP = async (cep: string): Promise<AddressViaCep> => {
    const response = await RequestExternalApi<null, AddressViaCep>({
        path: "https://viacep.com.br/ws/" + cep.replace("-", "") + "/json",
        method: "GET",
    });
    return response
};

export default GetAddressByCEP