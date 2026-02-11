"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useUser } from "@/app/context/user-context";
import Loading from "../loading";
import AccessDenied from "@/app/components/access-denied";
import { ReactNode } from "react";

export default function UserLayout({ children }: { children: ReactNode }) {
    const { hasPermission, isLoading, user } = useUser();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (isLoading) {
        return <Loading />;
    }

    if (!user) {
        return <AccessDenied message="Usuário não encontrado ou sessão expirada." />;
    }

    let requiredPermission: string | string[] | null = null;

    if (pathname?.startsWith('/pages/product')) {
        requiredPermission = ['product', 'category', 'process-rule'];
    } else if (pathname?.startsWith('/pages/client')) {
        requiredPermission = 'client';
    } else if (pathname?.startsWith('/pages/employee')) {
        requiredPermission = 'employee';
    } else if (pathname?.startsWith('/pages/new-order')) {
        requiredPermission = 'new-order';
    } else if (pathname?.startsWith('/pages/order-process')) {
        requiredPermission = 'order-process';
    } else if (pathname?.startsWith('/pages/place')) {
        requiredPermission = 'place';
    } else if (pathname?.startsWith('/pages/stock')) {
        requiredPermission = 'manage-stock';
    } else if (pathname?.startsWith('/pages/print')) {
        requiredPermission = 'print';
    } else if (pathname?.startsWith('/pages/billing')) {
        requiredPermission = 'billing';
    } else if (pathname?.startsWith('/pages/order-control')) {
        requiredPermission = 'order-control';
    } else if (pathname?.startsWith('/pages/order-delivery-control')) {
        requiredPermission = ['order-delivery-control-to-ship', 'order-delivery-control-to-finish', 'order-delivery-control-finished'];
    } else if (pathname?.startsWith('/pages/order-pickup-control')) {
        requiredPermission = 'order-pickup-control';
    } else if (pathname?.startsWith('/pages/order-table-control')) {
        requiredPermission = 'order-table-control';
    } else if (pathname?.startsWith('/pages/shift')) {
        requiredPermission = 'shift';
    } else if (pathname?.startsWith('/pages/admin-')) {
        requiredPermission = 'statistics';
    }

    if (requiredPermission) {
        const hasAccess = Array.isArray(requiredPermission)
            ? requiredPermission.some(p => hasPermission(p))
            : hasPermission(requiredPermission);

        if (!hasAccess) {
            return <AccessDenied />;
        }
    }

    return <>{children}</>;
}
