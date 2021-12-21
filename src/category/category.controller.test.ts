import supertest from 'supertest'; 

import server from '../app'
import DatabaseConnection from '../config/database';

import { CategoryRequest } from './category.interfaces'

describe('user controller', () => {

    let token: string; 

    const database = new DatabaseConnection().getDB(); 

    let updateCategoryId: string; 

    afterAll( async () => {

        database.query("DELETE FROM products WHERE name = 'Dell Computer' OR name = 'Lenove Computer' OR name = 'Lenove Computer Updated'"); 
        database.query("DELETE FROM users WHERE user_nickname = $1", ["lewon123"]); 
        database.query("DELETE FROM addresses WHERE province = $1", ['Pdsaodkarpackie']); 

    })

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
    
            //Create ADMIN role for user. 
            const currentCreatedUser = await database.query("SELECT * FROM users WHERE user_nickname = $1", ['lewon123']); 

            const userId = currentCreatedUser.rows[0].user_id; 

            await database.query("INSERT INTO roles(title, user_id) VALUES ($1, $2)", ['ADMIN', userId]); 

            const loginResponse = await supertest(server.getServer()).post('/authentication/login').send(loginCredentials); 

            token = loginResponse.body.token; 

    })


    it('should resolve a get all categories', async  () => {

        const response = await supertest(server.getServer()).get("/categories").set('Authorization', 'Bearer ' + token);

        expect(response.status).toBe(200); 
        expect(response.body).not.toBeNull(); 

    });

    it('should get category by specific id', async () => {

        const resultCategoryInsert = await database.query("INSERT INTO categories(title) VALUES($1) RETURNING *", ['Super Computers']); 

        const categoryId = resultCategoryInsert.rows[0].category_id; 

        updateCategoryId = categoryId;

        const response = await supertest(server.getServer()).get(`/categories/${categoryId}`).set('Authorization', 'Bearer ' + token);
    
        expect(response.status).toBe(200); 
        expect(response.body).not.toBeNull();
        expect(response.body.record.category_id).toBe(categoryId); 
        expect(response.body.record.title).toBe('Super Computers'); 

    });

    it('should create a new category', async () => {

        const categoryRequest: CategoryRequest = {
            title: "Toys"
        }

        const response = await supertest(server.getServer()).post("/categories").set('Authorization', 'Bearer ' + token).send(categoryRequest); 

        expect(response.status).toBe(200); 

    });

    it('should update a existing category', async () => {

        const updateRequest: CategoryRequest = {
            title: "Home Updated" 
        }

        const response = await supertest(server.getServer()).put(`/categories/${updateCategoryId}`).set('Authorization', 'Bearer ' + token).send(updateRequest); 

        expect(response.status).toBe(200); 

    })

    it('should delete a existing category', async () => {

        const response = await supertest(server.getServer()).delete(`/categories/${updateCategoryId}`).set('Authorization', 'Bearer ' + token); 

        expect(response.status).toBe(200); 

    })

    

})