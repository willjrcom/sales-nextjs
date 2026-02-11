"use client";

import ThreeColumnHeader from "@/components/header/three-column-header";
import React from "react";

export interface CrudLayoutProps {
    title: React.ReactNode;
    searchButtonChildren?: React.ReactNode;
    refreshButton?: React.ReactNode;
    tableChildren: React.ReactNode;
}

export default function CrudLayout({
    title,
    searchButtonChildren,
    refreshButton,
    tableChildren,
}: CrudLayoutProps) {
    return (
        <div className="container mx-auto p-6">
            <ThreeColumnHeader left={searchButtonChildren} center={title} right={refreshButton} />

            {/* Divider */}
            <div className="border-b my-4" />

            {/* Content with horizontal scroll if needed */}
            <div className="overflow-x-auto">
                {tableChildren}
            </div>
        </div>
    );
};