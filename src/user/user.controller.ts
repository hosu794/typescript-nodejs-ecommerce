import { NextFunction, Request, Response, Router } from "express";
import DatabaseConnection from "../config/database";
import Controller from "../interfaces/controller.interface";

import bcrypt from 'bcrypt'
import Token from '../authentication/authentication.middleware';

class UserController implements Controller {

    constructor() {
        this.initializeRoutes()
    }

    public readonly path: string = '/users'; 
    public router: Router = Router(); 

    private initializeRoutes() {
        this.router.get(this.path,  [Token.checkRole(["USER"])], this.getAllUsers)
    }

    public getAllUsers = async (request: Request, response: Response) => {

        const sql = "select users.user_id , user_firstname, user_lastname, user_nickname, address_id , country, province, city, street, street_number, post_code from users join addresses on users.user_id  = addresses.user_id;"; 
        
            new DatabaseConnection().getDB().query(sql, (err: any, results: any) => {
                if(err) {
                    throw err; 
                } 
                response.status(200).json(results.rows)
            })
    }

}

export default UserController