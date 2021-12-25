import DatabaseConnection from "../config/database";
import server from '../app'
import supertest from 'supertest'; 
import { OrderProductRequest, OrderStatusEnum, OrderStatusRequest } from "./order.interfaces";

// const orderRequest: Array<OrderProductRequest> = [
//     {
//         productId: Number(product1), 
//         quantity: 1
//     }
// ]; 

describe('order controller', () => {
    
    let token: string; 

    const database = new DatabaseConnection().getDB(); 

    let currentCategoryId: any; 
    let product1Id: any; 
    let userId: any; 
    let orderIdCurrentUser: any; 
    let product2Id: any; 
    let product3Id: any; 
    let product5Id: any

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

    afterAll(async () => {
        await database.query("DELETE FROM users WHERE user_nickname = $1", ["lewon123"]);
        await database.query("DELETE FROM orders WHERE order_id = $1", [orderIdCurrentUser]);
        await database.query("DELETE FROM products WHERE name = $1", ['Lego Star Wars']); 
        await database.query("DELETE FROM order_product WHERE order_id = $1", [orderIdCurrentUser]); 

        await database.query("DELETE FROM orders WHERE user_id = $1", [userId]); 

        await database.query("DELETE FROM products WHERE name = $1", ['Lego City']); 

        await database.query("DELETE FROM products WHERE name = $1", ['Lego Hobbit']); 

        await database.query("DELETE FROM products WHERE name = $1", ['Lego Hobbit Rohan']); 

        await database.query("DELETE FROM order_product WHERE product_id = $1", [product2Id]); 
        
    })

    beforeAll( async () => {

        currentCategoryId = await (await database.query("INSERT INTO categories(title) VALUES($1) RETURNING *", ['Super Toys'])).rows[0].category_id;
        
        await supertest(server.getServer()).post('/authentication/register').send(registerCredentials);

        userId = await (await database.query("SELECT * FROM users WHERE user_nickname = $1", [registerCredentials.nickname])).rows[0].user_id; 

        await database.query("INSERT INTO roles(title, user_id) VALUES($1, $2)", ["ADMIN", userId]);

        const loginResponse = await supertest(server.getServer()).post('/authentication/login').send(loginCredentials); 

        token = loginResponse.body.token;

    })

    it('should resolve get order by current user', async () => {
        
        const product1 = await database.query("INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4) RETURNING *", ['Lego Star Wars', currentCategoryId, 2020, 100]);
        product1Id = product1.rows[0].product_id; 

        const orderInsert = await database.query("INSERT INTO orders(user_id, order_status, order_date, required_date, shipped_date) VALUES($1, $2, $3, $4, $5) RETURNING *", [userId, 0, new Date(), null, null]); 
        
        orderIdCurrentUser = orderInsert.rows[0].order_id; 

        await database.query("INSERT INTO order_product(order_id, product_id, quantity) VALUES ($1, $2, $3)", [orderIdCurrentUser, product1Id, 1]); 

        const response = await supertest(server.getServer()).get(`/orders/current/user`).set('Authorization', 'Bearer ' + token); 
        
        expect(response.status).toBe(200); 
    });

    it('should create order', async  () => {
        
        const product2 = await database.query("INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4) RETURNING *", ['Lego City', currentCategoryId, 2020, 100]);
        product2Id = product2.rows[0].product_id; 

        const productsOrders: Array<OrderProductRequest> = [
            {
                productId: product2Id, 
                quantity: 1
            }
        ]

        const response = await supertest(server.getServer()).post(`/orders`).set('Authorization', 'Bearer ' + token).send(productsOrders); 
        
        expect(response.body.message).toBe('Order created successfully!'); 
        expect(response.status).toBe(201); 

    });

    it('should get order by id', async () => {
        
        const product3 = await database.query("INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4) RETURNING *", ['Lego Hobbit', currentCategoryId, 2020, 100]);
        product3Id = product3.rows[0].product_id; 

        const orderInsert = await database.query("INSERT INTO orders(user_id, order_status, order_date, required_date, shipped_date) VALUES($1, $2, $3, $4, $5) RETURNING *", [userId, 0, new Date(), null, null]); 
        
        orderIdCurrentUser = orderInsert.rows[0].order_id; 

        await database.query("INSERT INTO order_product(order_id, product_id, quantity) VALUES ($1, $2, $3)", [orderIdCurrentUser, product1Id, 1]); 

        const response = await supertest(server.getServer()).get(`/orders/${orderIdCurrentUser}`).set('Authorization', 'Bearer ' + token);
        
        expect(response.status).toBe(200); 

    });

    it('should change order status', async () => {
        
        const product5 = await database.query("INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4) RETURNING *", ['Lego Hobbit Rohan', currentCategoryId, 2020, 100]);
        product5Id = product5.rows[0].product_id; 

        const orderInsert = await database.query("INSERT INTO orders(user_id, order_status, order_date, required_date, shipped_date) VALUES($1, $2, $3, $4, $5) RETURNING *", [userId, 0, new Date(), null, null]); 
        
        orderIdCurrentUser = orderInsert.rows[0].order_id; 

        await database.query("INSERT INTO order_product(order_id, product_id, quantity) VALUES ($1, $2, $3)", [orderIdCurrentUser, product5Id, 1]); 

        const orderUpdateRequest: OrderStatusRequest = {
            status: OrderStatusEnum.AWAITING_PICKUP
        }

        const response = await supertest(server.getServer()).post(`/orders/change/order/status/${orderIdCurrentUser}`).set('Authorization', 'Bearer ' + token).send(orderUpdateRequest); 

        expect(response.body.message).toBe('Order status has changed successfully'); 
        expect(response.status).toBe(200);

    });

});