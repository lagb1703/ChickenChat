import { createTransport } from 'nodemailer';
import Enviroment from './enviroment';
import { EnviromentsVariablesEnum as Configuration } from './enums';

export interface EmailMessage {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
}

export default class EmailClient {
    private static instance: EmailClient;

    public static getInstance(): EmailClient {
        if (!EmailClient.instance) {
            EmailClient.instance = new EmailClient();
        }
        return EmailClient.instance;
    }

    private transporter;

    private constructor() {
        const e = Enviroment.getInstance();
        this.transporter = createTransport({
            host: e.get(Configuration.SMTP_HOST),
            port: Number(e.get(Configuration.SMTP_PORT)),
            secure: e.get(Configuration.SMTP_SECURE) === 'true',
            auth: {
                user: e.get(Configuration.SMTP_USER),
                pass: e.get(Configuration.SMTP_PASSWORD)
            }
        });
    }

    public async send(message: EmailMessage) {
        return this.transporter.sendMail(message);
    }
}