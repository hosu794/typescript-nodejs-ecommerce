import DatabaseConnection from "../config/database";
import server from '../app'
import supertest from 'supertest'; 
import { ProductRequest } from "./product.interfaces";


describe('product controller', () => {
    
    let token: string; 

    const database = new DatabaseConnection().getDB(); 

    let currentCategoryId: any; 

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
    
    afterAll( async () => {
        await database.query("DELETE FROM users WHERE user_nickname = $1", ["lewon123"]);
        await database.query("DELETE FROM categories WHERE title = $1", ['Super Cars']);  
        await database.query("DELETE FROM products WHERE name = $1", ['BMW X5 Sport']);       
        await database.query("DELETE FROM products WHERE name = $1", ['BMW M3 Plus']); 
        await database.query("DELETE FROM products WHERE name = $1", ['Porsche 911 Super']); 
        await database.query("DELETE FROM products WHERE name = $1", ['Porsche 911 Turbo Updated']); 
    })

    beforeAll( async () => {

            currentCategoryId = await (await database.query("INSERT INTO categories(title) VALUES($1) RETURNING *", ['Super Cars'])).rows[0].category_id;  

            await supertest(server.getServer()).post('/authentication/register').send(registerCredentials);

            const userId = await (await database.query("SELECT * FROM users WHERE user_nickname = $1", [registerCredentials.nickname])).rows[0].user_id; 

            await database.query("INSERT INTO roles(title, user_id) VALUES($1, $2)", ["ADMIN", userId]);
    
            const loginResponse = await supertest(server.getServer()).post('/authentication/login').send(loginCredentials); 

            token = loginResponse.body.token;

    })

    it('should get all products', async () => {
        
        const productCredentials = {
            name: 'BMW X5 Sport', 
            category: currentCategoryId, 
            modelYear: 2012, 
            price: 100000
        }

        await database.query("INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4)", [productCredentials.name, productCredentials.category, productCredentials.modelYear, productCredentials.price]); 

        const response = await supertest(server.getServer()).get("/products").set('Authorization', 'Bearer ' + token); 

        expect(response.status).toBe(200); 

    });

    it('should get product by id', async () => {
       
        const productCredentials = {
            name: 'BMW M3 Plus', 
            category: currentCategoryId, 
            modelYear: 2012, 
            price: 100000
        }

        const product = await database.query("INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4) RETURNING *", [productCredentials.name, productCredentials.category, productCredentials.modelYear, productCredentials.price]);

        const productId = product.rows[0].product_id; 

        const response = await supertest(server.getServer()).get(`/products/${productId}`).set('Authorization', 'Bearer ' + token); 

        expect(response.status).toBe(200);
        expect(response.body.item[0].name).toBe(productCredentials.name); 
        expect(response.body.item[0].category_id).toBe(productCredentials.category); 
        expect(response.body.item[0].model_year).toBe(productCredentials.modelYear); 
        expect(response.body.item[0].price).toBe(String(productCredentials.price)); 

    });

    it('should resolve create a product', async () => {
        const productRequest: ProductRequest = {
            modelYear: 2012, 
            name: "Porsche 911 Super",
            price: 1000000
        }; 

        const response = await supertest(server.getServer()).post(`/products/${currentCategoryId}`).set('Authorization', 'Bearer ' + token).send(productRequest); 

        expect(response.status).toBe(200); 
    });

    it('should resolve update a current product', async () => {
        
        const productRequest: ProductRequest = {
            modelYear: 2012, 
            name: "Porsche 911 Turbo",
            price: 1000000
        }; 

        const product = await database.query("INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4) RETURNING *", [productRequest.name, currentCategoryId, productRequest.modelYear, productRequest.price]);

        const productId = product.rows[0].product_id; 

        const productUpdateRequest: ProductRequest = {
            modelYear: 2012, 
            name: "Porsche 911 Turbo Updated",
            price: 1000000
        }

        const response = await supertest(server.getServer()).put(`/products/${productId}`).set('Authorization', 'Bearer ' + token).send(productUpdateRequest); 

        expect(response.status).toBe(200); 
        expect(response.body.message).toBe('Product has been updated.')

    });

    it('should resolve delete product', async () => {
        
        const productRequest: ProductRequest = {
            modelYear: 2012, 
            name: "Pegouet 418",
            price: 1000000
        }; 

        const product = await database.query("INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4) RETURNING *", [productRequest.name, currentCategoryId, productRequest.modelYear, productRequest.price]);

        const productId = product.rows[0].product_id; 

        const response = await supertest(server.getServer()).delete(`/products/${productId}`).set('Authorization', 'Bearer ' + token);
        
        expect(response.status).toBe(200); 
        expect(response.body.message).toBe('Record has deleted successfully'); 

    });

    it('should resolve get product by category', async () => {
        const productRequest: ProductRequest = {
            modelYear: 2019, 
            name: "Audi A4",
            price: 5000000
        }; 

        const product = await database.query("INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4) RETURNING *", [productRequest.name, currentCategoryId, productRequest.modelYear, productRequest.price]);

        const response = await supertest(server.getServer()).get(`/products/categories/${currentCategoryId}`).set('Authorization', 'Bearer ' + token);
        
        expect(response.status).toBe(200); 

    });

});