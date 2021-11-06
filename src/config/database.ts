
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

        this.db.query("SELECT * FROM films", (error: any, results: any) => {
            if(error) {
                throw error
            }

            console.log(results.rows)
        })
    }

    public getDB(): Pool.Pool {
        console.log(`Connected with database`)
        return this.db
    }
}

export default DatabaseConnection