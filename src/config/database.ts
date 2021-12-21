
import Pool from 'pg'
import { IDatabaseConnection } from '../types/database';

class DatabaseConnection implements IDatabaseConnection {
    
    public db: Pool.Pool;
    
    constructor() {
        this.db = new Pool.Pool({
            user: 'postgres',
            host: 'localhost',
            database: 'test',
            password: 'qwerty00',
            port: 5432,
        })

    }

    public getDB(): Pool.Pool {
        return this.db
    }
}

export default DatabaseConnection