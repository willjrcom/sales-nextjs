"use client";
import { usePathname } from "next/navigation";
import { useUser } from "@/app/context/user-context";
import Loading from "../loading";
import AccessDenied from "@/app/components/access-denied";
import { ReactNode, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { GetSubscriptionStatus } from "@/app/api/company/subscription/status";
import SubscriptionOverlay from "@/app/components/billing/subscription-overlay";

export default function UserLayout({ children }: { children: ReactNode }) {
    const { hasPermission, isLoading, user } = useUser();
    const { data: session } = useSession();
    const pathname = usePathname();

    const { data: subscriptionStatus } = useQuery({
        queryKey: ["subscription-status"],
        queryFn: () => GetSubscriptionStatus(session!),
        enabled: !!(session as any)?.user?.access_token,
        staleTime: 0,
        gcTime: 0, // Added gcTime to ensure immediate update
        refetchOnWindowFocus: true,
        refetchOnMount: true, // Added refetchOnMount to ensure immediate update
    });

    const isRestrictedPath = useMemo(() => {
        const restrictedPaths = [
            '/pages/new-order',
            '/pages/order-table-control',
            '/pages/order-pickup-control',
            '/pages/order-delivery-control',
            '/pages/order-control'
        ];
        return restrictedPaths.some(path => pathname?.startsWith(path));
    }, [pathname]);

    const isSubscriptionExpired = useMemo(() => {
        if (!subscriptionStatus) return false;

        const currentPlan = subscriptionStatus.current_plan?.toLowerCase();
        const daysRemaining = subscriptionStatus.days_remaining;

        // Se o plano for 'free' ou os dias restantes forem 0 ou menos, consideramos inativo/expirado
        const isFree = currentPlan === 'free' || !currentPlan;
        const hasNoTime = daysRemaining !== null && daysRemaining <= 0;

        const isExpired = isFree || hasNoTime;

        if (isRestrictedPath && isExpired) {
            console.log("Blocking access: Subscription is inactive/expired.", { currentPlan, daysRemaining });
        }

        return isExpired;
    }, [subscriptionStatus, isRestrictedPath]);

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
        requiredPermission = ['order-process', 'edit-order-process'];
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

    return (
        <>
            {isRestrictedPath && isSubscriptionExpired && <SubscriptionOverlay />}
            {children}
        </>
    );
}
