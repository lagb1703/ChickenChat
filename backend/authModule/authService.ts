import UserService from "../userModule/userService";
import Security from "./segurity";
import HttpException from "../utils/error";
import { ExceptionsEnum } from "./enums";
import { NextRequest } from "next/server";

export default class AuthService {
    private static instance: AuthService;

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    private userService: UserService;
    private security: Security;

    private constructor() {
        this.userService = UserService.getInstance();
        this.security = Security.getInstance();
    }

    public async login(username: string, password: string): Promise<string> {
        const user = await this.userService.login(username, password);
        if (!user) {
            throw new HttpException(ExceptionsEnum.INVALID_CREDENTIALS, 401);
        }
        return this.security.getToken(user);
    }

    public async refreshToken(token: string): Promise<string> {
        return this.security.refreshToken(token);
    }

    public async setUser(request: NextRequest): Promise<void> {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            throw new HttpException(ExceptionsEnum.MISSING_TOKEN, 401);
        }
        const token = authHeader.split(' ')[1];
        const isValid = await this.security.validateToken(token);
        if (!isValid) {
            throw new HttpException(ExceptionsEnum.INVALID_OR_EXPIRED_TOKEN, 401);
        }
        const userToken = await this.security.setUser(token);
        (request as any).user = userToken;
    }

    public async setAdminUser(request: NextRequest): Promise<void> {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            throw new HttpException(ExceptionsEnum.MISSING_TOKEN, 401);
        }
        const token = authHeader.split(' ')[1];
        const isValid = await this.security.validateToken(token);
        if (!isValid) {
            throw new HttpException(ExceptionsEnum.INVALID_OR_EXPIRED_TOKEN, 401);
        }
        const user = await this.security.setUser(token);
        if (!user.isAdmin) {
            throw new HttpException(ExceptionsEnum.INVALID_OR_EXPIRED_TOKEN, 401);
        }
        (request as any).user = user;
    }
}