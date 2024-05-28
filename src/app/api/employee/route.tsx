import { Employee } from "@/app/entities/employee/employee";

const GetEmployees = async (): Promise<Employee[]> => {
    const res = await fetch("http://localhost:8080/employee/all", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "id-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXJyZW50X3NjaGVtYSI6ImxvamFfaWJpdGlfXzJxaXRpdHNyIiwiZXhwIjoxNzE2OTQ0OTM3LCJzdWIiOiJpZC10b2tlbiIsInVzZXJfZW1haWwiOiJ3aWxsaWFtanVuaW9yNjlAZ21haWwuY29tIiwidXNlcl9pZCI6IjNkNDdlYjdkLTNjMjgtNDI5Mi05OWIzLTE5YWJkNDM3N2ZmMCJ9.P5NNcAFaXAeMafaGgxe8ge-8ooO_tMat4Js-c4jyurE"
        },
    });
    
    if (!res.ok) {
        throw new Error("Failed to fetch employees");
    }

    const {data} = await res.json();
    const employees = data as Employee[];
    return employees;
};

export default GetEmployees