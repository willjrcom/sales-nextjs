import { useState } from "react";
import Employee from "@/app/entities/employee/employee";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmployeeInfoTab from "./tabs/info";
import EmployeeSalaryTab from "./tabs/salary";
import EmployeePaymentsTab from "./tabs/payments";
import EmployeePermissionsTab from "./tabs/permissions";

interface EmployeeCardProps {
    item: Employee;
}

function EmployeeCard({ item }: EmployeeCardProps) {
    const [currentTab, setCurrentTab] = useState<string>('info');

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 mx-auto flex flex-col gap-6 max-w-2xl">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="info">Informações</TabsTrigger>
                    <TabsTrigger value="salary">Salário</TabsTrigger>
                    <TabsTrigger value="payments">Pagamentos</TabsTrigger>
                    <TabsTrigger value="permissions">Permissões</TabsTrigger>
                </TabsList>

                <TabsContent value="info">
                    <EmployeeInfoTab item={item} />
                </TabsContent>

                <TabsContent value="salary">
                    <EmployeeSalaryTab item={item} />
                </TabsContent>

                <TabsContent value="payments">
                    <EmployeePaymentsTab item={item} />
                </TabsContent>

                <TabsContent value="permissions">
                    <EmployeePermissionsTab item={item} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default EmployeeCard;