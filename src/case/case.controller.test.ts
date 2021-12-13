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

                nickname: "szczepan123", 
                password: "password123"
                }
        
                const loginResponse = await supertest(server.getServer()).post('/authentication/login').send(loginCredentials); 
        
                token = loginResponse.body.token;

        })
   
        it('should resolve create case', async () => {
            
                
                const productsToCreate: Array<ProductRequest> = [
                        {
                                name: "First Product", 
                                modelYear: 1992, 
                                price: 123,
                        },
                        {
                                name: "Second Product", 
                                modelYear: 2012, 
                                price: 240
                        }
                        ]; 
                
                const productsIds: Array<any> = [];

                productsToCreate.map( async (item: ProductRequest) => {
                
                        const result = await database.query("INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4)RETURNING *", [item.name, 2, item.modelYear, item.price]); 

                        const product_id = result.rows[0].product_id; 

                        productsIds.push({product_id: product_id, quantity: 1}); 

                })        


                const caseRequest: CaseRequest = {
                        products: productsIds
                }; 

                const response = await supertest(server.getServer()).post("/cases").set('Authorization', 'Bearer ' + token);

                expect(response.body.message).toBe('Case created successfully!'); 


        });





});