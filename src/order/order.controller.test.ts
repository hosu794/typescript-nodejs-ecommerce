import DatabaseConnection from "../config/database";
import server from '../app'
import supertest from 'supertest'; 

describe('order controller', () => {
    
    let token: string; 

    const database = new DatabaseConnection().getDB(); 

    const loginCredentials = {
        nickname: "lewon123", 
        password: "password123"
    }

    const registerCredentials = {
            firstname: "Robert", 
            lastname: "lewon", 
            nickname: "lewon123", 
            email: "levon123@gmail.com", 
            password: "password123", 
            country: "dPoland", 
            city: "Mdsadasinsk Mazowiecki", 
            street: "Stankdsadsaowizna", 
            street_number: 322, 
            post_code: "05-303",
            province: "Pdsaodkarpackie"
        }

    afterAll(async () => {
        await database.query("DELETE FROM users WHERE user_nickname = $1", ["lewon123"]);
    })

});