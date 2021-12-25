import server from '../app'
import supertest from 'supertest'; 
import DatabaseConnection from '../config/database';
import { CategoryRequest } from './category.interfaces';

describe('category controller', () => {
    
    let token: string; 

    const database = new DatabaseConnection().getDB(); 

    const loginCredentials = {
        nickname: "lewon123", 
        password: "password123"
    }

    let currentCategoryId: any; 

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

    beforeAll( async () => {

        await supertest(server.getServer()).post('/authentication/register').send(registerCredentials);

        const userId = await (await database.query("SELECT * FROM users WHERE user_nickname = $1", [registerCredentials.nickname])).rows[0].user_id; 

        await database.query("INSERT INTO roles(title, user_id) VALUES($1, $2)", ["ADMIN", userId]);

        const loginResponse = await supertest(server.getServer()).post('/authentication/login').send(loginCredentials); 

        token = loginResponse.body.token;

    })

    afterAll( async () => {

        await database.query("DELETE FROM users WHERE user_nickname = $1", ["lewon123"]);
        await database.query("DELETE FROM categories WHERE title = $1", ["First Category"]);
        await database.query("DELETE FROM categories WHERE title = $1", ["Category Firstname"]);
        await database.query("DELETE FROM categories WHERE title = $1", ["First Id"]);
        await database.query("DELETE FROM categories WHERE title = $1", ["Update category"]);
        await database.query("DELETE FROM categories WHERE title = $1", ["Delete category"]);
    })

    it('should get all categories', async () => {
        
        await database.query("INSERT INTO categories(title) VALUES ($1)", ['First Category']);

        const response = await supertest(server.getServer()).get(`/categories`).set('Authorization', 'Bearer ' + token);

        expect(response.status).toBe(200); 

    });

    it('should create a category', async () => {
        
        const categoryRequest: CategoryRequest = {
            title: 'Category Firstname'
        }

        const response = await supertest(server.getServer()).post(`/categories`).set('Authorization', 'Bearer ' + token).send(categoryRequest); 

        expect(response.body.message).toBe('Category created successfully!'); 
        expect(response.status).toBe(200); 

    });

    it('should get category by id', async () => {
        
        const category = await database.query("INSERT INTO categories(title) VALUES ($1) RETURNING *", ['First Id']);

        const categoryId = category.rows[0].category_id; 

        const response = await supertest(server.getServer()).get(`/categories/${categoryId}`).set('Authorization', 'Bearer ' + token);

        expect(response.status).toBe(200); 

    });

    it('should update category', async () => {

        const category = await database.query("INSERT INTO categories(title) VALUES ($1) RETURNING *", ['Update category']);

        const categoryId = category.rows[0].category_id; 

        const updateRequest: CategoryRequest = {
            title: "Updated request"
        }

        const response = await supertest(server.getServer()).put(`/categories/${categoryId}`).set('Authorization', 'Bearer ' + token).send(updateRequest); 

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Record has updated successfully');

    });

    it('should delete category', async () => {

        const category = await database.query("INSERT INTO categories(title) VALUES ($1) RETURNING *", ['Delete category']);

        const categoryId = category.rows[0].category_id; 

        const response = await supertest(server.getServer()).delete(`/categories/${categoryId}`).set('Authorization', 'Bearer ' + token);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Record has deleted successfully');

    });

});