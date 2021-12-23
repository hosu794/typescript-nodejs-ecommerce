import DatabaseConnection from "../config/database";
import server from '../app'
import supertest from 'supertest'; 
import { CaseRequest, CaseRequestItem, CaseRequestProductIds } from "./case.interface";

describe('case controller', () => {
    
    let token: string; 

    const database = new DatabaseConnection().getDB(); 

    let product1Id: any;
    let product2Id: any;
    let product3Id: any;
    let product4Id: any;
    let product5Id: any;
    let product6Id: any; 

    let caseId: any; 
    let caseUpdateId: any;

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

            currentCategoryId = await (await database.query("INSERT INTO categories(title) VALUES($1) RETURNING *", ['Super Cars'])).rows[0].category_id;  

            await supertest(server.getServer()).post('/authentication/register').send(registerCredentials);

            const userId = await (await database.query("SELECT * FROM users WHERE user_nickname = $1", [registerCredentials.nickname])).rows[0].user_id; 

            await database.query("INSERT INTO roles(title, user_id) VALUES($1, $2)", ["ADMIN", userId]);
    
            const loginResponse = await supertest(server.getServer()).post('/authentication/login').send(loginCredentials); 

            token = loginResponse.body.token;

    })

    afterAll( async () => {

        const currentUser = await database.query("SELECT * FROM users WHERE user_nickname = $1", ["lewon123"]); 
        const userId = currentUser.rows[0].user_id; 

        await database.query("DELETE FROM case_products WHERE product_id = $1", [product1Id]); 
        await database.query("DELETE FROM case_products WHERE product_id = $1", [product2Id]); 
        await database.query("DELETE FROM cases WHERE user_id = $1", [userId]); 

        await database.query("DELETE FROM users WHERE user_nickname = $1", ["lewon123"]);
        await database.query("DELETE FROM categories WHERE title = $1", ['Super Cars']);  
        await database.query("DELETE FROM products WHERE name = $1", ['BMW M2']);       
        await database.query("DELETE FROM products WHERE name = $1", ['BMW I3']); 
        await database.query("DELETE FROM products WHERE name = $1", ['BMW M2 Super']);       
        await database.query("DELETE FROM products WHERE name = $1", ['BMW I3 Super']); 
        await database.query("DELETE FROM case_products WHERE case_id = $1", [caseId]); 
        await database.query("DELETE FROM case_products WHERE case_id = $1", [caseUpdateId]);
        await database.query("DELETE FROM products WHERE name = $1", ['Fiat 500']); 
        await database.query("DELETE FROM cases WHERE case_id = $1", [caseUpdateId]); 
    })

        
    it('should resolve create a case',  async () => {

        const product1 = await database.query("INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4) RETURNING *", ['BMW M2', currentCategoryId, 2020, 1000000]);
        product1Id = product1.rows[0].product_id; 

       const product2 = await database.query("INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4) RETURNING *", ['BMW I3', currentCategoryId, 2020, 1000000]);
        product2Id = product2.rows[0].product_id; 

       const caseRequest: CaseRequest = {
           products: [
               {
                   product_id: product1Id,
                   quantity: 2
               },
               {
                   product_id: product2Id, 
                   quantity: 1
               }
           ]
       }

       const response = await supertest(server.getServer()).post("/cases").set('Authorization', 'Bearer ' + token).send(caseRequest); 

       expect(response.body.message).toBe('Case created successfully!')
       expect(response.status).toBe(201); 
       
    });

    it('should resolve delete case', async () => {

        const currentUser = await database.query("SELECT * FROM users WHERE user_nickname = $1", ["lewon123"]); 
        const userId = currentUser.rows[0].user_id; 

        const existingCase = await database.query("SELECT * FROM cases WHERE user_id = $1", [userId]); 
        const currentCaseId = existingCase.rows[0].case_id; 
        await database.query("DELETE FROM case_products WHERE case_id = $1", [currentCaseId]); 

        await database.query("DELETE FROM cases WHERE user_id = $1", [userId]); 

        const product3 = await database.query("INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4) RETURNING *", ['BMW M2 Super', currentCategoryId, 2020, 1000000]);
        product3Id = product3.rows[0].product_id; 

       const product4 = await database.query("INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4) RETURNING *", ['BMW I3 Super', currentCategoryId, 2020, 1000000]);
        product4Id = product4.rows[0].product_id; 

        const caseRequest: CaseRequest = {
            products: [
                {
                    product_id: product3Id,
                    quantity: 2
                },
                {
                    product_id: product4Id, 
                    quantity: 1
                }
            ]
        }

        const createCaseResult = await database.query("INSERT INTO cases(user_id) VALUES ($1) RETURNING *", [currentUser.rows[0].user_id]); 
         caseId = createCaseResult.rows[0].case_id; 

        await database.query("INSERT INTO case_products(case_id, product_id, quantity) VALUES($1, $2, $3)", [caseId, product3Id, 1]);
        await database.query("INSERT INTO case_products(case_id, product_id, quantity) VALUES($1, $2, $3)", [caseId, product4Id, 1]);

        const response = await supertest(server.getServer()).delete("/cases").set('Authorization', 'Bearer ' + token).send(caseRequest); 
            
        expect(response.status).toBe(202); 
    });

    it('should resolve add product to case', async () => {
        
        const currentUser = await database.query("SELECT * FROM users WHERE user_nickname = $1", ["lewon123"]); 
        const userId = currentUser.rows[0].user_id; 

        // const existingCase = await database.query("SELECT * FROM cases WHERE user_id = $1", [userId]); 
        // const currentCaseId = existingCase.rows[0].case_id; 
        // await database.query("DELETE FROM case_products WHERE case_id = $1", [currentCaseId]); 

        await database.query("DELETE FROM cases WHERE user_id = $1", [userId]); 

        const product5 = await database.query("INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4) RETURNING *", ['Fiat 500', currentCategoryId, 2020, 1000000]);
        product5Id = product5.rows[0].product_id; 

        const productsToRequest: Array<CaseRequestItem> = [
            {
                product_id: product5Id, 
                quantity: 1
            }
        ]

        const createCaseResult = await database.query("INSERT INTO cases(user_id) VALUES ($1) RETURNING *", [currentUser.rows[0].user_id]); 
         caseUpdateId = createCaseResult.rows[0].case_id; 

        const response = await supertest(server.getServer()).post("/cases/products/add").set('Authorization', 'Bearer ' + token).send(productsToRequest); 

        expect(response.body.message).toBe("Case's products updated!"); 
        expect(response.status).toBe(201); 
    });

    });

