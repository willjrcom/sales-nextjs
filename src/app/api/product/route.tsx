import { Product } from "@/app/entities/product/product";

const GetProducts = async (): Promise<Product[]> => {
    const res = await fetch("http://localhost:8080/product/all", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "id-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXJyZW50X3NjaGVtYSI6ImxvamFfaWJpdGlfXzJxaXRpdHNyIiwiZXhwIjoxNzE2ODkxMTkyLCJzdWIiOiJpZC10b2tlbiIsInVzZXJfZW1haWwiOiJ3aWxsaWFtanVuaW9yNjlAZ21haWwuY29tIiwidXNlcl9pZCI6IjNkNDdlYjdkLTNjMjgtNDI5Mi05OWIzLTE5YWJkNDM3N2ZmMCJ9.fIif12mS8kTTW0ool8ZkcDstP3HkueFvk20JxHkeqNg"
        },
    });
    console.log(res)
    if (!res.ok) {
        throw new Error("Failed to fetch products");
    }

    const {data} = await res.json();
    const products = data as Product[];
    return products;
};

export default GetProducts