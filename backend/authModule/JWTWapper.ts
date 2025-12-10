import { sign, verify } from 'jsonwebtoken';
import { EnviromentsVariablesEnum as Configuration } from '../utils/enums';
import Enviroment from '../utils/enviroment';

export default class JWTWrapper {
    private key: string;
    private exp: number;
    private header: Object;
    constructor() {
        const env = Enviroment.getInstance();
        this.key = env.get(Configuration.JWT_SECRET_KEY);
        // expiration expressed as seconds (time-to-live), not an absolute timestamp
        this.exp = 60 * 60 * 24; // 24 hours (in seconds)
        this.header = {
            algorithm: 'HS256',
        };
    }

    // `exp` parameter (if provided) is treated as seconds (TTL).
    // Returns the JWT as a string (conventional usage).
    public async encode(payload: Record<string, any>, key?: string, exp?: number): Promise<string> {
        payload["exp"] = Math.floor(Date.now() / 1000) + (exp ? exp : this.exp);
        return sign(payload, key || this.key, this.header);
    }

    public async decode<T>(token: string, key?: string): Promise<T> {
        return verify(token, key || this.key) as T;
    }

    public async refreshToken(token: string): Promise<string> {
        const decoded = await this.decode<Record<string, any>>(token.toString());
        delete decoded.exp;
        return this.encode(decoded);
    }
}