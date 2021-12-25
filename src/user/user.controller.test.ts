import supertest from 'supertest'; 

import server from '../app'
import DatabaseConnection from '../config/database';

describe('user controller', () => {

    let token: string; 

    const database = new DatabaseConnection().getDB(); 

    beforeAll( async () => {

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

            await supertest(server.getServer()).post('/authentication/register').send(registerCredentials);
    
            const loginResponse = await supertest(server.getServer()).post('/authentication/login').send(loginCredentials); 

            token = loginResponse.body.token;

        token = loginResponse.body.token; 
    })

    afterAll( async () => {

        await database.query("DELETE FROM users WHERE user_nickname = $1", ["lewon123"]); 

    })


    it('should resolve with all users', async  () => {

        const response = await supertest(server.getServer()).get("/users").set('Authorization', 'Bearer ' + token)

        expect(response.status).toBe(200); 
        expect(response.body).not.toBeNull(); 

    });

})