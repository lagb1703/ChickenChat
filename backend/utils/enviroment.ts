import { config } from "dotenv";
import { ExceptionEnum } from "./enums";

export default class Enviroment {
    private static instance: Enviroment;

    private constructor() {
        config();
    }

    public static getInstance(): Enviroment {
        if (!Enviroment.instance) {
            Enviroment.instance = new Enviroment();
        }
        return Enviroment.instance;
    }

    public get(key: string): string {
        if (!process.env[key]) {
            throw new Error(ExceptionEnum.MISSING_ENV_VARIABLE.replace(":key", key));
        }
        return process.env[key];
    }
}