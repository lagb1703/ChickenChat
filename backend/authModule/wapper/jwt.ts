import AuthService from "../authService";
import { withErrorHandling } from "@/backend/utils/error";
const authService = AuthService.getInstance();

export function jwt<T extends (...args: any[]) => any>(handler: T) {
    return async function (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | Response> {
        const wrapped = withErrorHandling(async (...innerArgs: Parameters<T>) => {
            const req = innerArgs[0] as Request;
            await authService.setUser(req);
            return handler(...innerArgs);
        });
        // cast to any because withErrorHandling returns a function with the same params
        return wrapped(...(args as any));
    };
}