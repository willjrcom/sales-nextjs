import axios from "axios";

// Exemplo de uso
export const apiKey = "4f638e9ecf444f81b5eb379318936d87";
export const address = "Praça da Sé, São Paulo, Brasil";

const geocodeAddressOpenCage = async (address: string, apiKey: string): Promise<{ lat: number; lng: number } | null> => {
    try {
        const response = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
            params: {
                q: address,
                key: apiKey,
            }, 
        });

        const result = response.data.results[0];
        if (result) {
            const { lat, lng } = result.geometry;
            return { lat, lng };
        } else {
            console.error("Endereço não encontrado.");
            return null;
        }
    } catch (error) {
        console.error("Erro ao geocodificar o endereço:", error);
        return null;
    }
};

export default geocodeAddressOpenCage;