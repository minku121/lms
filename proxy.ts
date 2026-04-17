import { withAuth } from "next-auth/middleware";

const authMiddleware = withAuth({
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development",
});

export default function proxy(req: any, event: any) {
  return (authMiddleware as any)(req, event);
}

export const config = {
  matcher: ["/dashboard/:path*"]
};
