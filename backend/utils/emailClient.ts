import { createTransport } from 'nodemailer';

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
        this.transporter = createTransport({
            host: 'smtp.example.com',
            port: 587,
            secure: false,
            auth: {
                user: '',
                pass: ''
            }
        });
    }

    public async send(message: EmailMessage) {
        return this.transporter.sendMail(message);
    }
}