import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        // Test database connection
        const userCount = await prisma.user.count();

        return NextResponse.json({
            success: true,
            message: "Database connection successful",
            userCount,
            env: {
                hasDatabaseUrl: !!process.env.DATABASE_URL,
                hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            },
        });
    } catch (error) {
        console.error("Database test error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                stack: error instanceof Error ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}
