import express from "express";
import DatabaseConnection from "../config/database";
import Controller from "../interfaces/controller.interface";
import { UserRequest } from "../user/user.interface";
import Pool from 'pg'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'; 
import { TokenMessage, UserLogin } from "./authentication.interface";
import { verifyToken } from "./authentication.middleware";



class AuthenticationController implements Controller {
    constructor() {
        this.initializeRoutes(); 
    }

    public readonly path: string = '/authentication'; 
    router: express.Router = express.Router(); 

    private initializeRoutes() {
        this.router.post(`${this.path}/register`, this.registerUser); 
        this.router.post(`${this.path}/login`, this.loginUser);
        this.router.get(`${this.path}/token`, verifyToken,this.getToken);  
    }

    private registerUser = async (request: express.Request, response: express.Response) => {

        const newUser: UserRequest | any = request.body;

        const database = new DatabaseConnection().getDB();

        database.query("SELECT * FROM WHERE user_email = $1", [newUser.email], async (error, results) => {
            if(!results) {
                console.log("User doesn't exist!")

                const hashedPassword: string = await bcrypt.hashSync(newUser.password, 10);

                database.query("INSERT INTO users (user_firstname, user_lastname, user_nickname, user_password) VALUES ($1, $2, $3 , $4)", [newUser.firstname, newUser.lastname, newUser.nickname, hashedPassword] ,(error, results) => {

                    if(error) {
                        throw error
                    }

                    database.query("SELECT user_id FROM users WHERE user_nickname = $1", [newUser.nickname], (error, results) => {
                        if (error) {
                            throw error
                        }

                        const user_id: number = results.rows[0].user_id;
                        
                        database.query("INSERT INTO addresses (user_id, country, province, city, street, street_number, post_code) VALUES ($1, $2, $3, $4, $5, $6, $7) ", [user_id, newUser.country, newUser.province, newUser.city, newUser.street, newUser.street_number, newUser.post_code], (error, results) => {
                            
                            if(error) {
                                throw error
                            }

                            response.status(201).json({message: 'User has created successfully'})

                        })

                    })


                })

            }
        })

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
            message: 'Token created successfully!', token
        })
    }

    private getToken = async (request: express.Request, response: express.Response)  => {

        //@ts-ignore
        response.json(request.user).status(200); 

    }


}

export default AuthenticationController