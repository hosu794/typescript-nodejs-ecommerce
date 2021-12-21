import { QueryResult } from 'pg';
import supertest from 'supertest'; 

import server from '../app'
import DatabaseConnection from '../config/database';
import { OrderProductRequest } from '../order/order.interfaces';
import { ProductRequest } from '../product/product.interfaces';
import { UserQueryResponse } from '../user/user.interface';
import { CaseRequest, CaseRequestItem, CaseRequestProductIds } from './case.interface';

describe('case controller tests', () => {

        const database = new DatabaseConnection().getDB(); 

        let token: string;  

        beforeAll( async () => {

        await database.query("DELETE FROM cases", []); 
        await database.query("DELETE FROM products", []); 
        await database.query("DELETE FROM case_products", []); 

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

                console.log('Token: ', token);

        })
   
        it('should resolve create case', async () => {
            
                
                // const productsToCreate: Array<ProductRequest> = [
                //         {
                //                 name: "First Product", 
                //                 modelYear: 1992, 
                //                 price: 123,
                //         },
                //         {
                //                 name: "Second Product", 
                //                 modelYear: 2012, 
                //                 price: 240
                //         }
                //         ]; 
                
                // const productsIds: Array<any> = [];

                // productsToCreate.map( async (item: ProductRequest) => {
                
                //         const result = await database.query("INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4)RETURNING *", [item.name, 2, item.modelYear, item.price]); 

                //         const product_id = result.rows[0].product_id; 

                //         productsIds.push({product_id: product_id, quantity: 1}); 

                // })        

                // const caseRequest: CaseRequest = {
                //         products: productsIds
                // }; 

                // const response = await supertest(server.getServer()).post("/cases").set('Authorization', 'Bearer ' + token).send(caseRequest); 

                // expect(response.body.message).toBe('Case created successfully!'); 

        });

        it('should resolve add product to case', async () => {
                
                // const productsToCreate: Array<ProductRequest> = [
                //         {
                //                 name: "First Product", 
                //                 modelYear: 1992, 
                //                 price: 123,
                //         },
                //         {
                //                 name: "Second Product", 
                //                 modelYear: 2012, 
                //                 price: 240
                //         }
                //         ]; 
                
                // const productsIds: Array<any> = [];

                // productsToCreate.map( async (item: ProductRequest, index) => {

                
                //         const result = await database.query("INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4)RETURNING *", [item.name, 2, item.modelYear, item.price]); 

                //         const product_id = result.rows[0].product_id; 

                //         productsIds.push({product_id: product_id, quantity: 1}); 

                //         if(productsToCreate.length -1  === index) {

                //                 const response = await supertest(server.getServer()).post("/cases/products/add").set('Authorization', 'Bearer ' + token).send(productsIds); 

                //                 expect(response.body.message).toBe("Case's products updated!"); 
                //         }
                // })        

        });

        it('should resolve delete case',  async () => {


                // const currentUserResponse: QueryResult = await database.query("SELECT * FROM users WHERE user_nickname = $1", ['szczepan123']); 

                // const currentUserId = currentUserResponse.rows[0].user_id; 

                // await database.query("INSERT INTO cases(user_id) VALUES($1)", [currentUserId]); 
   
                // const response = await supertest(server.getServer()).delete("/cases").set('Authorization', 'Bearer ' + token); 

                // expect(response.body.message).toBe("Case deleted successfully!"); 

        });

        it('should resolve delete products from case', async () => {

                // const productIds: Array<CaseRequestItem> = [
                //         {
                //                 product_id: 12212, 
                //                 quantity: 1
                //         }
                // ]; 

                // const resultCategoryInsert = await database.query("INSERT INTO categories(title) VALUES($1) RETURNING *", ['Super Computers']); 

                // const currentUser = await database.query("SELECT * FROM users WHERE user_nickname = $1", ['szczepan123']); 

                // const currentUserId = currentUser.rows[0].user_id;

                // const resultCaseInsert = await database.query("INSERT INTO cases(user_id) VALUES($1)",[currentUserId]); 
                // const caseId = resultCaseInsert.rows[0].case_id;

                // const categoryId = resultCategoryInsert.rows[0].category_id; 

                // await database.query("INSERT INTO products VALUES($1, $2, $3, $4, $5)", [12212, 'Amazing Computer',categoryId, 2012, 2000]);
                
                // await database.query("INSERT INTO case_products VALUES($1, $2, $3, $4)", [12323, caseId, 12212, 1]); 

                // const currentUserResponse: QueryResult = await database.query("SELECT * FROM users WHERE user_nickname = $1", ['szczepan123']); 

                // const currentUserId = currentUserResponse.rows[0].user_id; 

                // await database.query("INSERT INTO cases(user_id) VALUES($1)", [currentUserId]); 

                // const response = await supertest(server.getServer()).delete("/cases/products").set('Authorization', 'Bearer ' + token).send(productIds); 

        })

});