import supertest from 'supertest'; 
import { isRegExp } from 'util/types';

import server from '../app'
import DatabaseConnection from '../config/database';

import { ProductRequest } from '../product/product.interfaces'; 
import { OrderProductRequest, OrderStatusEnum, OrderStatusRequest } from './order.interfaces';

describe('order controller tests',   () => {

    let token: string;  

    let udpdateProcuctId: number; 

    let orderId: any; 
    
    const database = new DatabaseConnection().getDB(); 
    
     afterAll( async () => {

        database.query("DELETE FROM products WHERE name = 'First Product' OR name = 'Second Product'", [])

        database.query("DELETE FROM orders", []); 
        database.query("DELETE FROM order_product", []); 
        database.query("DELETE FROM users WHERE user_nickname = $1", ["lewon123"]); 
        database.query("DELETE FROM addresses WHERE province = $1", ['Pdsaodkarpackie']); 
     })

     beforeAll( async () => {
        
        database.query("DELETE FROM products WHERE name = 'Dell Computer' OR name = 'Lenove Computer' OR name = 'Lenove Computer Updated'"); 

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


    it('should resolve create order', async () => {
        
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

        const productsIds: Array<OrderProductRequest> = []; 

        productsToCreate.map( async (item: ProductRequest) => {
        
            const result = await database.query("INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4)RETURNING *", [item.name, 2, item.modelYear, item.price]); 

            const product_id = result.rows[0].product_id; 

            productsIds.push({productId: product_id, quantity: 1}); 
        })

        const response = await supertest(server.getServer()).post('/orders').send(productsIds).set('Authorization', 'Bearer ' + token);

        expect(response.body.message).toBe('Order created successfully!'); 
        
    });

    it('should resolve get order by id', async () => {

        const currentUser = await database.query("SELECT * FROM users WHERE user_nickname = $1", ["lewon123"]); 

        const currentUserId = currentUser.rows[0].user_id; 

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

        const productsIds: Array<OrderProductRequest> = []; 

        productsToCreate.map( async (item: ProductRequest) => {
        
            const result = await database.query("INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4)RETURNING *", [item.name, 2, item.modelYear, item.price]); 

            const product_id = result.rows[0].product_id; 

            productsIds.push({productId: product_id, quantity: 1}); 
        }); 
        
       const orderInsertResponse = await database.query("INSERT INTO orders(user_id, order_status, order_date, required_date, shipped_date) VALUES($1, $2, $3, $4, $5) RETURNING *", [currentUserId, 0, new Date(), null, null]);
       
        orderId = orderInsertResponse.rows[0].order_id; 

        productsIds.map( async (item: OrderProductRequest) => {
                
                await database.query("INSERT INTO order_product(order_Id, product_id, quantity) VALUES($1, $2, $3)", [orderId, item.productId, item.quantity]);

        }); 

       const response = await supertest(server.getServer()).get(`/orders/${orderId}`).send(productsIds).set('Authorization', 'Bearer ' + token);
       console.log(response.body);

       expect(response.body.result.order_id).toBe(orderId); 

    });

    it('should resolve change order status', async () => {
        
        const orderStatusNumber: OrderStatusRequest = {status: OrderStatusEnum.AWAITING_PICKUP}; 

        const response = await supertest(server.getServer()).post(`/orders/change/order/status/${orderId}`).send(orderStatusNumber).set('Authorization', 'Bearer ' + token);

        expect(response.body.message).toBe('Order status has changed successfully'); 

    });

})