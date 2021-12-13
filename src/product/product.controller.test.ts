import { QueryResult } from 'pg';
import supertest from 'supertest'; 

import server from '../app'
import DatabaseConnection from '../config/database';
import { ProductRequest } from './product.interfaces';


describe('product controller',   () => {

    let token: string;  

    let udpdateProcuctId: number; 
    
    const database = new DatabaseConnection().getDB(); 
    
     beforeAll( async () => {
        
        database.query("DELETE FROM products WHERE name = 'Dell Computer' OR name = 'Lenove Computer' OR name = 'Lenove Computer Updated'"); 

        const loginCredentials = {
            nickname: "szczepan123", 
            password: "password123"
        }

        const loginResponse = await supertest(server.getServer()).post('/authentication/login').send(loginCredentials); 

        token = loginResponse.body.token; 
    })


    it('should resolve a get all products', async  () => {

        const response = await supertest(server.getServer()).get("/products").set('Authorization', 'Bearer ' + token);

        expect(response.status).toBe(200); 
        expect(response.body).not.toBeNull(); 

    });

    it('should resolve get product by id',  async () => {
        
        const resultInsertCategory: QueryResult = await database.query("INSERT INTO categories(title) VALUES($1) RETURNING * ", ['Cars']); 

        const categoryId = resultInsertCategory.rows[0].category_id; 
        
        console.log("Category id: ", categoryId);

        const sqlToCreateProduct: string = "INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4) RETURNING *"; 

        const product = {
            name: 'BMW M5', 
            modelYear: 2012, 
            price: 10000
        }

        const resultProductInsert = await database.query(sqlToCreateProduct, [product.name, categoryId, product.modelYear, product.price]); 
        
        const productId = resultProductInsert.rows[0].product_id; 

        const response = await supertest(server.getServer()).get(`/products/${productId}`).set('Authorization', 'Bearer ' + token);

        expect(response.status).toBe(200); 

        await database.query("DELETE FROM categories WHERE category_id = $1", [categoryId]); 

        await database.query("DELETE FROM products WHERE product_id = $1", [productId]); 

    });

    it('should resolve creating product', async () => {

        const productRequest: ProductRequest = {
            modelYear: 2020, 
            name: "Lenove Computer", 
            price: 1200
        }
        
        const response = await supertest(server.getServer()).post("/products/2").set('Authorization', 'Bearer ' + token).send(productRequest); 

        expect(response.status).toBe(200); 
        expect(response.body.message).toBe('Product has created successfully!');;  

    });

    it('should resolve update product', async () => {

        const productResponseInsert: QueryResult = await database.query("INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4) RETURNING *", ["Dell Computer", 2, 2010, 440]); 
        udpdateProcuctId = productResponseInsert.rows[0].product_id;


        
        const productUpdateRequest: ProductRequest = {
            modelYear: 2020, 
            name: "Lenove Computer Updated", 
            price: 1200
        }

        const response = await supertest(server.getServer()).put(`/products/${udpdateProcuctId}`).set('Authorization', 'Bearer ' + token).send(productUpdateRequest); 

        expect(response.status).toBe(200); 
        expect(response.body.message).toBe('Product has been updated.');
        
    })

    it('should resolve delete product', async () => {
        
        const productResponseInsert: QueryResult = await database.query("INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4) RETURNING *", ["Alienware Computer", 2, 2014, 2000]); 

        const deletingProductId = productResponseInsert.rows[0].product_id; 
        
        const response = await supertest(server.getServer()).delete(`/products/${deletingProductId}`).set('Authorization', 'Bearer ' + token);

        expect(response.status).toBe(200); 
        expect(response.body.message).toBe('Record has deleted successfully'); 

    });

    it('should resolve get product by id', async () => {
        
        const productResponseInsert: QueryResult = await database.query("INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4) RETURNING *", ["Alienware Computer", 2, 2014, 2000]); 
        
        const productToFetchId = productResponseInsert.rows[0].product_id; 

        const response  = await supertest(server.getServer()).get(`/products/${productToFetchId}`).set('Authorization', 'Bearer ' + token);

        expect(response.status).toBe(200); 

    })


})