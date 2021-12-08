import { QueryResult } from 'pg';
import supertest from 'supertest'; 

import server from '../app'
import DatabaseConnection from '../config/database';

import { CategoryRequest } from './category.interfaces'

describe('user controller', () => {

    let token: string; 


    let updateCategoryId: string; 

    beforeAll( async () => {

        const database = new DatabaseConnection().getDB(); 

        database.query("DELETE FROM categories WHERE title = 'Toys'");
        database.query("DELETE FROM categories WHERE title ='Home Updated'"); 
        database.query("DELETE FROM categories WHERE title ='Home'"); 

        const insertResult: QueryResult = await database.query("INSERT INTO categories(title) VALUES('Home') RETURNING *");
        
        updateCategoryId = insertResult.rows[0].category_id

        const loginCredentials = {
            nickname: "szczepan123", 
            password: "password123"
        }

        const loginResponse = await supertest(server.getServer()).post('/authentication/login').send(loginCredentials); 

        token = loginResponse.body.token; 
    })


    it('should resolve a get all categories', async  () => {

        const response = await supertest(server.getServer()).get("/categories").set('Authorization', 'Bearer ' + token);

        expect(response.status).toBe(200); 
        expect(response.body).not.toBeNull(); 

    });

    it('should get category by specific id', async () => {
        
        const response = await supertest(server.getServer()).get("/categories/2").set('Authorization', 'Bearer ' + token);
    
        expect(response.status).toBe(200); 
        expect(response.body).not.toBeNull();
        expect(response.body.record.category_id).toBe(2); 
        expect(response.body.record.title).toBe('Electronic'); 

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