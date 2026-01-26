"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export default function SignOutButton() {
    return (
        <Button
            variant="danger"
            className="w-full"
            onClick={() => signOut({ callbackUrl: "/login" })}
        >
            Sign Out
        </Button>
    );
}
