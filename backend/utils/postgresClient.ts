import { Pool } from 'pg';

export class PostgresClient {
    private static instance: PostgresClient;

    public static getInstance(): PostgresClient {
        if (!PostgresClient.instance) {
            PostgresClient.instance = new PostgresClient();
        }
        return PostgresClient.instance;
    }

    private pool: Pool;

    private constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });
    }
    public async query<T, Q>(sql: string, data: Array<Q>): Promise<Array<T>> { 
        const client = await this.pool.connect();
        try {
            const res = await client.query(sql, data);
            return res.rows;
        } finally {
            client.release();
        }
    }
    public async save<T, Q>(sql: string, data: Q): Promise<T> {
        const client = await this.pool.connect();
        try {
            const stringify = JSON.stringify(data);
            const res = await client.query(sql, stringify ? [JSON.parse(stringify)] : []);
            return res.rows[0];
        } finally {
            client.release();
        }
    }
    public async update<Q, T>(sql: string, data: Q, id: number | string): Promise<T> {
        const client = await this.pool.connect();
        try {
            const stringify = JSON.stringify(data);
            const res = await client.query(sql, stringify ? [JSON.parse(stringify), id] : [id]);
            return res.rows[0];
        } finally {
            client.release();
        }
    }
    public async delete<T>(sql: string, id: number | string): Promise<T> {
        const client = await this.pool.connect();
        try {
            const res = await client.query(sql, [id]);
            return res.rows[0];
        } finally {
            client.release();
        }
    }
}