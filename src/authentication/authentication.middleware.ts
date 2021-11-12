import express from "express";
import jwt, { JwtPayload } from 'jsonwebtoken'; 

interface TokenInteface {
      verifyToken(request: express.Request, response: express.Response, next: express.NextFunction): Promise<void>;
      extractToken(req: express.Request): any;
}

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

}

export default Token; 
