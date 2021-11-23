import express from 'express'; 

export interface UserLogin {
    nickname: string; 
    password: string; 
}

export interface TokenMessage {
    message: string, 
    token: string
}

export interface TokenInteface {
    verifyToken(request: express.Request, response: express.Response, next: express.NextFunction): Promise<void>;
    extractToken(req: express.Request): any;
    checkRole(roles: Array<string>): any; 
}