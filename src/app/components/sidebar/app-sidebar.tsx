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
    FaCircle,
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
import { usePrintAgent } from "@/app/pages/(user)/print/print"
import Loading from "../../loading";

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
}

export function AppSidebar({ ...props }: AppSidebarProps) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const modalHandler = useModal()
    const { data: session } = useSession()
    const { hasPermission, isLoading } = useUser()
    const { connected: printerConnected } = usePrintAgent()

    const { data: company } = useQuery({
        queryKey: ["company"],
        queryFn: () => GetCompany(session!),
        enabled: !!(session?.user as any)?.access_token,
    })

    const handleCompanyModal = () => {
        if (!hasPermission('manage-company')) return

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

    const items = [
        { label: "Novo Pedido", icon: FaPlus, href: "/pages/new-order", permission: 'new-order' },
        { label: "Processos", icon: TiFlowMerge, href: "/pages/order-process", permission: ['order-process', 'edit-order-process'] },
        // Produto é um caso especial, pode ter product, category ou process-rule
        { label: "Cardápio", icon: MdFastfood, href: "/pages/product?tab=products", permission: ['product', 'category', 'process-rule', 'menu-digital'] },
        { label: "Clientes", icon: BsFillPeopleFill, href: "/pages/client", permission: 'client' },
        { label: "Funcionários", icon: FaUserTie, href: "/pages/employee", permission: 'employee' },
        { label: "Mesas", icon: FaTh, href: "/pages/place", permission: 'place' },
        { label: "Estoque", icon: FaBox, href: "/pages/stock", permission: 'manage-stock' },
        { label: "Gestão de Custos", icon: MdOutlineAttachMoney, href: "/pages/billing", permission: 'billing' },
    ].filter(item => {
        if (!item.permission) return true;
        if (Array.isArray(item.permission)) {
            return item.permission.some(p => hasPermission(p));
        }
        return hasPermission(item.permission);
    });

    if (isLoading) {
        return <Loading />;
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" onClick={handleCompanyModal} tooltip={company?.trade_name}>
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <MdOutlineHomeWork className="size-5" />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-semibold">{company?.trade_name || "Empresa"}</span>
                                {hasPermission('manage-company') && <span className="text-xs text-muted-foreground">Editar</span>}
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
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
                    {hasPermission('print') && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={printerConnected ? 'Conectado' : 'Desconectado'}>
                                <Link href="/pages/print">
                                    <FaCircle className={`w-3 h-3 ${printerConnected ? 'text-green-500 animate-pulse' : 'text-red-500'}`} />
                                    <span className={printerConnected ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                        {printerConnected ? 'Conectado' : 'Desconectado'}
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}

                    {hasPermission('statistics') && (
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Painel Admin" onClick={
                                () => {
                                    router.push("/pages/admin-report")
                                }
                            }>
                                <FaTools />
                                <span>
                                    Painel Admin
                                </span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}

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
                        <SidebarMenuButton onClick={signOutToLogin} tooltip="Sair">
                            <FaSignOutAlt />
                            <span>Sair</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar >
    )
}
