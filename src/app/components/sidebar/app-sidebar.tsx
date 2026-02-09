"use client"

import * as React from "react"
import {
    FaUserTie,
    FaPlus,
    FaSignOutAlt,
    FaRedo,
    FaTh,
    FaTools,
    FaPrint,
    FaBox,
    FaClock,
    FaChartBar,
} from "react-icons/fa"
import { TiFlowMerge } from "react-icons/ti"
import {
    MdFastfood,
    MdOutlineAttachMoney,
    MdOutlineHomeWork,
} from "react-icons/md"
import { BsFillPeopleFill } from "react-icons/bs"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import GetCompany from "@/app/api/company/company"
import { useModal } from "@/app/context/modal/context"
import { useUser } from "@/app/context/user-context"
import CompanyForm from "@/app/forms/company/form"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    adminMode: boolean
    toggleAdminMode: () => void
}

export function AppSidebar({ adminMode, toggleAdminMode, ...props }: AppSidebarProps) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const modalHandler = useModal()
    const { data: session } = useSession()
    const { hasPermission, isLoading } = useUser()

    const { data: company } = useQuery({
        queryKey: ["company"],
        queryFn: () => GetCompany(session!),
        enabled: !!session?.user?.access_token,
    })

    const handleCompanyModal = () => {
        const onClose = () => {
            modalHandler.hideModal("edit-company-" + company?.id)
        }

        modalHandler.showModal(
            "edit-company-" + company?.id,
            "Editar Empresa",
            <CompanyForm item={company} isUpdate />,
            "md",
            onClose
        )
    }

    const signOutToLogin = async () => {
        await signOut({ callbackUrl: "/login", redirect: true })
    }

    const userItems = [
        { label: "Novo Pedido", icon: FaPlus, href: "/pages/new-order", permission: 'new-order' },
        { label: "Processos", icon: TiFlowMerge, href: "/pages/order-process", permission: 'order-process' },
        // Produto é um caso especial, pode ter product, category ou process-rule
        { label: "Cardápio", icon: MdFastfood, href: "/pages/product?tab=products", permission: ['product', 'category', 'process-rule'] },
        { label: "Clientes", icon: BsFillPeopleFill, href: "/pages/client", permission: 'client' },
        { label: "Funcionários", icon: FaUserTie, href: "/pages/employee", permission: 'employee' },
        { label: "Mesas", icon: FaTh, href: "/pages/place", permission: 'place' },
        { label: "Estoque", icon: FaBox, href: "/pages/stock", permission: 'manage-stock' },
        { label: "Impressão", icon: FaPrint, href: "/pages/print", permission: 'print' },
        { label: "Planos", icon: MdOutlineAttachMoney, href: "/pages/billing", permission: 'billing' },
    ].filter(item => {
        if (!item.permission) return true;
        if (Array.isArray(item.permission)) {
            return item.permission.some(p => hasPermission(p));
        }
        return hasPermission(item.permission);
    });

    const adminItems = [
        { label: "Processos", icon: TiFlowMerge, href: "/pages/admin-order-process" },
        { label: "Cardápio", icon: MdFastfood, href: "/pages/admin-product" },
        { label: "Clientes", icon: BsFillPeopleFill, href: "/pages/admin-client" },
        { label: "Funcionários", icon: FaUserTie, href: "/pages/admin-employee" },
        { label: "Mesas", icon: FaTh, href: "/pages/admin-place" },
        { label: "Pedidos", icon: FaPlus, href: "/pages/admin-order" },
        { label: "Turnos", icon: FaClock, href: "/pages/admin-shift" },
        { label: "Relatórios", icon: FaChartBar, href: "/pages/admin-report" },
    ]

    // Se estiver carregando, mostra vazio ou esqueleto? Por enquanto vazio para nao piscar itens proibidos
    const items = adminMode ? adminItems : isLoading ? [] : userItems

    return (
        <Sidebar collapsible="icon" {...props} className={adminMode ? "border-blue-800" : ""}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" onClick={handleCompanyModal} tooltip={company?.trade_name}>
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <MdOutlineHomeWork className="size-5" />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-semibold">{company?.trade_name || "Empresa"}</span>
                                <span className="text-xs text-muted-foreground">Editar</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu {adminMode ? "Admin" : "Usuário"}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.label}>
                                    <SidebarMenuButton asChild tooltip={item.label}>
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={async () => {
                                queryClient.clear()
                                router.push("/access/company-selection")
                            }}
                            tooltip="Trocar de empresa"
                        >
                            <FaRedo />
                            <span>Trocar de empresa</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={toggleAdminMode} tooltip={adminMode ? "Modo Usuário" : "Modo Admin"}>
                            <FaTools />
                            <span>{adminMode ? "Modo Usuário" : "Modo Admin"}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={signOutToLogin} tooltip="Sair">
                            <FaSignOutAlt />
                            <span>Sair</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
