import express from 'express'; 

export interface ExpressRequestWithUser extends express.Request {
    user: CurrentUser;
}

export interface CurrentUser {
    id: string;
    expires: string;
    at: string;
}