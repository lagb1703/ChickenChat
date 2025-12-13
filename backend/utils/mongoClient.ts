import * as mg from "mongodb";
import Enviroment from "./enviroment";
import { EnviromentsVariablesEnum as Configuration } from './enums';

export default class MongoClient {
    private static instance: MongoClient;

    public static getInstance(): MongoClient {
        if (!MongoClient.instance) {
            MongoClient.instance = new MongoClient();
        }
        return MongoClient.instance;
    }

    private readonly mongodb: mg.MongoClient;

    private readonly database: string;

    constructor() {
        const e = Enviroment.getInstance();
        const URI = `mongodb+srv://${e.get(Configuration.MONGO_USER_NAME)}:${e.get(Configuration.MONGO_PASSWORD)}@${e.get(Configuration.MONGO_HOST)}/?retryWrites=true&w=majority`;
        this.mongodb = new mg.MongoClient(URI);
        this.mongodb.connect();
        this.database = e.get(Configuration.MONGO_DATABASE);
    }
    async aggregate<T>(
        collection: string,
        pipeline: mg.BSON.Document[],
        options?: mg.AggregateOptions & mg.Abortable
    ): Promise<T[]> {
        try {
            const db = this.mongodb.db(this.database);
            const cn = db.collection(collection);
            return await cn.aggregate(pipeline, options).toArray() as T[];
        } catch (err) {
            console.error('Error in processing:\n', err);
            throw err;
        }
    }

    /**
     * Realiza una consulta find en la base de datos.
     * @param collection La colección que se va a consultar.
     * @param filters Los parámetros de filtrado para la consulta. (Opcional)
     * @param projections La proyeccion de la consulta. (Opcional)
     * @returns El cursor de la consulta.
     */
    async query(
        collection: string,
        filters?: mg.Filter<mg.Document>,
        projections?: mg.FindOptions
    ): Promise<mg.WithId<mg.BSON.Document>[]> {
        try {
            const db = this.mongodb.db(this.database);
            const cn = db.collection(collection);
            const document = cn.find(filters || {}, projections);
            return document.toArray();
        } catch (err) {
            console.error('Error in processing:\n', err);
            throw err;
        }
    }

    /**
     * Ejecuta un insertOne en la base de datos.
     * @param collection La colección que se va a guardar el documento.
     * @param document Documento a guardar.
     * @param options Las opciones de guardado. (opcional)
     * @returns Devuelve el objectId del documento guardado
     */
    async insert<T extends object>(
        collection: string,
        document: T,
        options?: mg.InsertOneOptions
    ): Promise<mg.BSON.ObjectId> {
        try {
            const db: mg.Db = this.mongodb.db()
            const cn: mg.Collection = db.collection(collection);
            const result = await cn.insertOne(document, options);
            if (!result.acknowledged)
                throw Error("Algo fallo en la consulta")
            return result.insertedId;
        } catch (err) {
            console.error('Error in processing:\n', err);
            throw err;
        }
    }

    /**
     * Ejecuta un updateMany en la base de datos.
     * @param collection La colección que se va a actualizar el documento.
     * @param document Documento a actualizar.
     * @param filters Los parámetros de filtrado para la consulta. 
     * @param options Las opciones de guardado. (opcional)
     * @returns Devuelve elobjectId
     */
    async update<T extends object>(
        collection: string,
        document: T,
        filters: mg.Filter<mg.BSON.Document>,
        options?: mg.UpdateOptions
    ): Promise<mg.BSON.ObjectId> {
        try {
            const db: mg.Db = this.mongodb.db()
            const cn: mg.Collection = db.collection(collection);
            const result = await cn.updateMany(filters, document, options)
            if (!result.acknowledged)
                throw Error("Algo fallo en la consulta")
            if (!result.upsertedId)
                throw Error("No se encontró un upsertedId")
            return result.upsertedId;
        } catch (err) {
            console.error('Error in processing:\n', err);
            throw err;
        }
    }

    /**
     * Ejecuta un deleteMany en la base de datos.
     * @param collection Sentencia SQL para ejecutar el procedimiento almacenado.
     * @param filters Los parámetros de filtrado para la consulta.
     * @param options Las opciones de guardado. (opcional)
     * @returns NO retorna nada
     */
    async delete(
        collection: string,
        filters: mg.Filter<mg.BSON.Document>,
        options?: mg.DeleteOptions
    ): Promise<any> {
        try {
            const db: mg.Db = this.mongodb.db()
            const cn: mg.Collection = db.collection(collection);
            const result = await cn.deleteMany(filters, options)
            if (!result.acknowledged)
                throw Error("Algo fallo en la consulta")
        } catch (err) {
            console.error('Error in processing:\n', err);
            throw err;
        }
    }
}