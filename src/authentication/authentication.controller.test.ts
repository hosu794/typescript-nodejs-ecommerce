import supertest from 'supertest'; 

import server from '../app'; 
import DatabaseConnection from '../config/database';


describe('user controller', () => {

    const database = new DatabaseConnection().getDB(); 

    const registerCredentials = {
        firstname: "Robert", 
        lastname: "lewandowski", 
        nickname: "lewandowski123", 
        email: "lewandowski123@gmail.com", 
        password: "password123", 
        country: "Poland", 
        city: "Minsk Mazowiecki", 
        street: "Stankowizna", 
        street_number: 32, 
        post_code: "05-303",
        province: "Podkarpackie"
    }

    beforeAll( async () => {
        await database.query("DELETE FROM users WHERE user_nickname = 'lewandowski123'"); 
    })

    it('should register a user', async  () => {
        
        const registerResponse = await supertest(server.getServer()).post('/authentication/register').send(registerCredentials); 

        expect(registerResponse.status).toBe(201); 

    });

    it('should login a user', async () => {
        
        const loginCredentials = {
            nickname: "lewandowski123",
            password: "password123"
        }

        const loginResponse = await supertest(server.getServer()).post("/authentication/login").send(loginCredentials); 

        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.token).not.toBeNull();
        expect(loginResponse.body.message).not.toBeNull();

    });


})