"use client";

import { CartToAdd } from "../cart/cart-to-add";
import { useQuery } from "@tanstack/react-query";
import GroupItemEdit from "./group-item-edit";
import GetGroupItemByID from "@/app/api/group-item/[id]/group-item";
import { useSession } from "next-auth/react";

interface SelectGroupItemProps {
    id?: string;
}

export default function SelectGroupItem({ id }: SelectGroupItemProps) {
    const { data: session } = useSession();
    const { data: groupItem } = useQuery({
        queryKey: ['group-item', 'current'],
        queryFn: () => GetGroupItemByID(id!, session!),
        enabled: !!session?.user?.access_token && !!id
    })

    if (!groupItem || groupItem?.status === "Staging") {
        return (
            <div>
                <CartToAdd />
            </div>
        );
    }

    return (
        <GroupItemEdit />
    );
}
