import express from "express";
import jwt, { JwtPayload } from 'jsonwebtoken'; 
import { consumers } from "stream";
import DatabaseConnection from "../config/database";
import { TokenInteface } from "./authentication.interface";

let Token: TokenInteface;

Token = class Token {

    static verifyToken = async (request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> => {

        const token: any = this.extractToken(request); 
        
        try {

            const vericationResponse: string | JwtPayload = jwt.verify(token, 'secret'); 
            //@ts-ignore
            request.user = vericationResponse;
            
            next(); 
        } catch (error) {
            response.status(401).json({message: 'Wrong token!'}); 
            next(); 
        }
    }

    static extractToken (req: express.Request) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        }
        return null;
    }

    static checkRole (roles: Array<string>) {
        return async (request: express.Request, response: express.Response, next: express.NextFunction) => {

            const token: any = this.extractToken(request); 

            const tokenResponse: string | JwtPayload = jwt.verify(token, 'secret'); 

            const database = new DatabaseConnection().getDB(); 
            
            const sqlQuery: string = "SELECT roles.title FROM users JOIN roles ON users.user_id = roles.user_id WHERE users.user_id = $1"; 

            //@ts-ignore
            const results: any = await database.query(sqlQuery, [tokenResponse.id]);

            console.log(roles.indexOf(results.rows[0].title))

           if(roles.indexOf(results.rows[0].title) > -1 ) next();
           else response.sendStatus(401).send(); 

        }
    }

}

export default Token; 
