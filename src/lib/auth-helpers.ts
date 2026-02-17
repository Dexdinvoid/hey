import { prisma } from "@/lib/db";
import { User as SupabaseUser } from "@supabase/supabase-js";

export async function syncUser(user: SupabaseUser) {
    // Check if user exists (double check)
    const existing = await prisma.user.findUnique({
        where: { id: user.id },
    });

    if (existing) return existing;

    // Generate a username from email
    // Fallback to "user" if email is missing (unlikely)
    const baseUsername = user.email?.split("@")[0] || "user";
    // Keep only alphanumeric and underscores, lowercase
    const sanitizedBase = baseUsername.replace(/[^a-z0-9_]/gi, "").toLowerCase();

    let finalUsername = sanitizedBase || "user";

    // Ensure uniqueness
    let suffix = 0;
    while (true) {
        const candidate = suffix ? `${finalUsername}${suffix}` : finalUsername;
        const taken = await prisma.user.findUnique({
            where: { username: candidate },
        });
        if (!taken) {
            finalUsername = candidate;
            break;
        }
        suffix++;
    }

    // Create user
    try {
        return await prisma.user.create({
            data: {
                id: user.id,
                email: user.email!, // Email is required in schema usually
                username: finalUsername,
                displayName: user.user_metadata?.full_name || finalUsername,
                avatarUrl: user.user_metadata?.avatar_url,
            },
        });
    } catch (error) {
        console.error("Error creating user in syncUser:", error);
        // If creation fails (e.g. race condition), try fetching again
        const retryExisting = await prisma.user.findUnique({
            where: { id: user.id },
        });
        if (retryExisting) return retryExisting;

        throw error;
    }
}
