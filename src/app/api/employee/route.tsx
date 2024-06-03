import { Employee } from "@/app/entities/employee/employee";

const GetEmployees = async (): Promise<Employee[]> => {
    const res = await fetch("http://localhost:8080/employee/all", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "id-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXJyZW50X3NjaGVtYSI6ImxvamFfaWJpdGlfXzJxaXRpdHNyIiwiZXhwIjoxNzE3MDE0OTU5LCJzdWIiOiJpZC10b2tlbiIsInVzZXJfZW1haWwiOiJ3aWxsaWFtanVuaW9yNjlAZ21haWwuY29tIiwidXNlcl9pZCI6IjNkNDdlYjdkLTNjMjgtNDI5Mi05OWIzLTE5YWJkNDM3N2ZmMCJ9.Ph2x17ukuFqf5M-UmCh7J-V91xcyFUoe8VEDv5x9Vs0"
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