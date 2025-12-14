import PostgresClient from "../utils/postgresClient";
import EmailClient from "../utils/emailClient";
import { SqlEnum } from "./enums/sql";
import { User, UserToken } from "./interfaces/user";
import { createHash } from "crypto";

export default class UserService {
    private static instance: UserService;

    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    private postgress: PostgresClient;
    private email: EmailClient;

    private constructor() {
        this.postgress = PostgresClient.getInstance();
        this.email = EmailClient.getInstance();
    }

    public async login(userName: string, password: string): Promise<UserToken> {
        try{
            const hashedPassword = createHash("sha256").update(password).digest("hex");
            return (await this.postgress.query<UserToken, string>(SqlEnum.login, [userName, hashedPassword]))[0];
        }catch (err) {
            console.error('Error in processing:\n', err);
            throw err;
        }
    }
    public async register(user: User): Promise<boolean> {
        try{
            user.isAdmin = false;
            user.password = createHash("sha256").update(user.password).digest("hex");
            await this.postgress.save<{p_id: number}, User>(SqlEnum.register, user);
            return true;
        } catch (err) {
            console.error('Error in processing:\n', err);
            throw err;
        }
    }
    public async getUserById(id: number | string): Promise<User> {
        try{
            return (await this.postgress.query<User, number | string>(SqlEnum.getUserById, [id]))[0];
        } catch (err) {
            console.error('Error in processing:\n', err);
            throw err;
        }
    }
}