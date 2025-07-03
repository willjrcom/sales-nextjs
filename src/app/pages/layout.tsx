import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import Menu from "../components/menu/layout";
import PageError from "./error";
import { Suspense } from "react";
import Loading from "./loading";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "GFood - Painel",
    description: "Sistema de vendas para estabelecimentos",
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ErrorBoundary errorComponent={PageError}>
            <Suspense fallback={<Loading />}>
                <Menu>
                    {children}
                </Menu>
            </Suspense>
        </ErrorBoundary>
    );
}
