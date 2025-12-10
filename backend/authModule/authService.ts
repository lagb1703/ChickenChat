import UserService from "../userModule/userService";

export default class AuthService {
    private static instance: AuthService;

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    private userService: UserService;

    private constructor() {
        this.userService = UserService.getInstance();
    }
}