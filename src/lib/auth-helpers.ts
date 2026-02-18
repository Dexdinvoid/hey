import { prisma } from "@/lib/db";
import { User as SupabaseUser } from "@supabase/supabase-js";

export async function syncUser(user: SupabaseUser) {
    // Check if user exists by id or email
    const existing = await prisma.user.findFirst({
        where: {
            OR: [
                { id: user.id },
                { email: user.email! },
            ],
        },
    });

    if (existing) {
        // Update the existing record to keep it in sync
        return await prisma.user.update({
            where: { id: existing.id },
            data: {
                email: user.email!,
                displayName: user.user_metadata?.full_name || existing.displayName,
                avatarUrl: user.user_metadata?.avatar_url || existing.avatarUrl,
            },
        });
    }

    // Generate a username from email
    const baseUsername = user.email?.split("@")[0] || "user";
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

    // Create user with upsert to handle race conditions
    try {
        return await prisma.user.upsert({
            where: { email: user.email! },
            update: {
                id: user.id,
                displayName: user.user_metadata?.full_name || finalUsername,
                avatarUrl: user.user_metadata?.avatar_url,
            },
            create: {
                id: user.id,
                email: user.email!,
                username: finalUsername,
                displayName: user.user_metadata?.full_name || finalUsername,
                avatarUrl: user.user_metadata?.avatar_url,
            },
        });
    } catch (error) {
        console.error("Error creating user in syncUser:", error);
        const retryExisting = await prisma.user.findFirst({
            where: {
                OR: [{ id: user.id }, { email: user.email! }],
            },
        });
        if (retryExisting) return retryExisting;

        throw error;
    }
}
