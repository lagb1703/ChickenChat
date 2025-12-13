import AuthService from "../authService";
import { withErrorHandling } from "@/backend/utils/error";
import { NextRequest } from "next/server";
const authService = AuthService.getInstance();
export function admin<T extends (req: Request | NextRequest) => Promise<Response> | Response>(
    handler: T,
) {
    return async function (request: Request) {
        return withErrorHandling(async (req: Request) => {
            await authService.setAdminUser(req);
            return handler(req);
        })(request);
    };
}