import JWTWrapper from "./JWTWapper";
import { User, UserToken } from "../userModule/interfaces/user";
import {EnviromentsVariablesEnum as Configuration} from "../utils/enums";
import Enviroment from "../utils/enviroment";

export default class Security {
    private static instance: Security;

    public static getInstance(): Security {
        if (!Security.instance) {
            Security.instance = new Security();
        }
        return Security.instance;
    }
    private jwt: JWTWrapper;
    private constructor() {
        this.jwt = new JWTWrapper();
    }
    public async validateToken(token: string): Promise<boolean> {
        try{
            await this.jwt.decode<any>(token);
            return true;
        } catch {
            return false;
        }
    }

    public async getToken(user: UserToken): Promise<string> {
        return this.jwt.encode(user);
    }

    public async setUser(token: string): Promise<UserToken> {
        return this.jwt.decode<UserToken>(token);
    }

    public async refreshToken(token: string): Promise<string> {
        return this.jwt.refreshToken(token);
    }
}