import supertest from 'supertest'; 

import server from '../app'

describe('user controller', () => {

    let token: string; 

    beforeAll( async () => {

        const loginCredentials = {
            nickname: "szczepan123", 
            password: "password123"
        }

        const loginResponse = await supertest(server.getServer()).post('/authentication/login').send(loginCredentials); 

        token = loginResponse.body.token; 
    })


    it('should resolve with all users', async  () => {

        const response = await supertest(server.getServer()).get("/users").set('Authorization', 'Bearer ' + token)

        expect(response.status).toBe(200); 
        expect(response.body).not.toBeNull(); 

    });

})