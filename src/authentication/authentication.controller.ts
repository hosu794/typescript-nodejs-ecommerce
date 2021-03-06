import express from "express";
import DatabaseConnection from "../config/database";
import Controller from "../interfaces/controller.interface";
import Pool from 'pg'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'; 
import {  UserLogin } from "./authentication.interface";

class AuthenticationController implements Controller {
    constructor() {
        this.initializeRoutes(); 
    }

    public readonly path: string = '/authentication'; 
    router: express.Router = express.Router(); 

    private initializeRoutes() {
        this.router.post(`${this.path}/register`, this.registerUser); 
        this.router.post(`${this.path}/login`, this.loginUser);
    }

    private registerUser = async (request: express.Request, response: express.Response) => {
        const newUser:  any = request.body;

        const database = new DatabaseConnection().getDB();

        const hashedPassword: string = bcrypt.hashSync(newUser.password, 10);

        const resultsOfExistedUser = await database.query("SELECT user_id FROM users WHERE user_nickname = $1", [newUser.nickname]);

        if(resultsOfExistedUser.rowCount !== 0) response.status(400).json({message: 'User exists with this nickname!'}); 

        await database.query("INSERT INTO users (user_firstname, user_lastname, user_nickname, user_password) VALUES ($1, $2, $3 , $4)", [newUser.firstname, newUser.lastname, newUser.nickname, hashedPassword]);
        const {rowCount, rows} = await database.query("SELECT user_id FROM users WHERE user_nickname = $1", [newUser.nickname]);
        
        const user_id: number = rows[0].user_id;

        await database.query("INSERT INTO addresses (user_id, country, province, city, street, street_number, post_code) VALUES ($1, $2, $3, $4, $5, $6, $7) ", [user_id, newUser.country, newUser.province, newUser.city, newUser.street, newUser.street_number, newUser.post_code]);

        await database.query("INSERT INTO roles (user_id, title) VALUES ($1, $2)", [user_id, "USER"]); 

        response.status(201).json({message: "User has created successfully!"}); 
    
    }

    private loginUser = async (request: express.Request, response: express.Response) => {

        const user: UserLogin = request.body; 

        const database: Pool.Pool  = new DatabaseConnection().getDB(); 
        
        const result = await database.query("SELECT * FROM users WHERE user_nickname = $1", [user.nickname])

        if(result.rowCount === 0) {
            response.status(400).json({message: "User doesn't exists!"}); 
        }

        const isValid = bcrypt.compareSync(user.password, result.rows[0].user_password); 

        if(!isValid) {
            response.status(400).json({message: "Wrong Password!"}); 
        }
        
        const token: string = jwt.sign({id: result.rows[0].user_id}, 'secret', {
            expiresIn: 86400
        }); 

        response.status(200).json({
            message: 'Token created bsuccessfully!', token
        })
    }

    


}

export default AuthenticationController