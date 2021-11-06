import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import express from 'express';

import DatabaseConnection from './config/database'
import { IDatabaseConnection } from './types/database';

class App {
    private app: express.Application
    private database: any; 

    constructor(controllers: any) {
        this.app = express()
        this.database = new DatabaseConnection().getDB()
        this.listen()
    }

    public listen(): void {
        this.app.listen(5000, () => {
            console.log(`App listening on the port 5000}`)
        })
    }

    public getServer(): express.Application {
        return this.app
    }

}

export default App