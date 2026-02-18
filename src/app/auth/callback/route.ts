import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncUser } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            // Sync the OAuth user into our Prisma database
            try {
                await syncUser(data.user);
            } catch (syncError) {
                console.error("Failed to sync OAuth user:", syncError);
                // Don't block login if sync fails — user is still authenticated
            }

            const forwardedHost = request.headers.get("x-forwarded-host");
            const isLocalEnv = process.env.NODE_ENV === "development";

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${origin}${next}`);
            }
        }
    }

    // Return to login with an error if something went wrong
    return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent("OAuth sign-in failed. Please try again.")}`
    );
}
