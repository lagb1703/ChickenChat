import AuthService from "../authService";
import { withErrorHandling } from "@/backend/utils/error";
const authService = AuthService.getInstance();
export function admin<T extends (req: Request) => Promise<Response> | Response>(
    handler: T,
) {
    return async function (request: Request) {
        return withErrorHandling(async (req: Request) => {
            await authService.setAdminUser(req);
            return handler(req);
        })(request);
    };
}