import * as bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express';

import DatabaseConnection from './config/database'
import Controller from './interfaces/controller.interface';
import PaypalRestApiConfig from './paypal/paypal.config';

class App {
    private app: express.Application

    constructor(controllers: any) {
        this.app = express()
        this.listen()


        this.intitializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
        const paypal: PaypalRestApiConfig = new PaypalRestApiConfig()
    }

    public listen(): void {
        this.app.listen(5000, () => {
            console.log(`App listening on the port 5000}`)
        })
    }

    private initializeErrorHandling() {

    }

    private intitializeMiddlewares() {
        this.app.use(bodyParser.json())
        this.app.use(cookieParser())
    }

    public getServer(): express.Application {
        return this.app
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach(controller => {
            this.app.use('/', controller.router)
        })
    }

}

export default App
