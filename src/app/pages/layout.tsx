'use client';

import Menu from "../components/menu/layout";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Menu>
            {children}
        </Menu>
    );
}
