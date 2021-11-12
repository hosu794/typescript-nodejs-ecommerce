import express from "express";
import jwt, { JwtPayload } from 'jsonwebtoken'; 

interface ExpressRequestWithUser extends express.Request {
    userId: string; 
}

interface JwtPayloadWithUserID extends JwtPayload {
    id: number; 
}

export const verifyToken = async (request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> => {

        const token: any = extractToken(request); 
        
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

function extractToken (req: express.Request) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        return req.query.token;
    }
    return null;
}