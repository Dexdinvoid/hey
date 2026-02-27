"use client";

import { usePathname } from "next/navigation";
import { RightSidebar } from "./right-sidebar";

/**
 * Conditionally renders the RightSidebar.
 * Hidden on pages that have their own right-column layout (e.g. profile).
 */
const HIDDEN_ON = ["/profile"];

export function ConditionalRightSidebar() {
    const pathname = usePathname();

    // Hide on profile pages (they have their own 3-column layout)
    const shouldHide = HIDDEN_ON.some((route) => pathname.startsWith(route));
    if (shouldHide) return null;

    return <RightSidebar />;
}
