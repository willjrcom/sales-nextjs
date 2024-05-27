const GetProducts = async () => {
    const res = await fetch("https://localhost:8080/product/all");
    const products = await res.json();
    return Response.json(products);
};

export default GetProducts