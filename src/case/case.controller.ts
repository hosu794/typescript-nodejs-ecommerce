import { request, Router } from "express";
import Controller from "../interfaces/controller.interface";

import express from 'express';
import { CaseRequest, CaseRequestItem, CaseRequestProductIds } from "./case.interface";

import Pool, { QueryResult, QueryResultBase, ResultBuilder } from 'pg';
import DatabaseConnection from "../config/database";
import { ExpressRequestWithUser } from "../helpers/request.interfaces";
import Token from "../authentication/authentication.middleware";
import { ProductResponse } from "../product/product.interfaces";

class CaseController implements Controller {

    constructor() {
        this.initializeRoutes();
        this.database = new DatabaseConnection().getDB();
    }

    public readonly path: string = "/cases";
    public router: Router = express.Router();
    database: Pool.Pool;

    private initializeRoutes() {

        this.router.post(`${this.path}`, Token.checkRole(['ADMIN', 'USER']), this.createCase);
        this.router.delete(`${this.path}`, Token.checkRole(['ADMIN', 'USER']), this.deleteCase); 
        this.router.post(`${this.path}/products/add`, Token.checkRole(['ADMIN', 'USER']), this.addProductsToCase);
        this.router.delete(`${this.path}/products`, Token.checkRole(['ADMIN', 'USER']), this.deleteProductFromCase); 
        
    }

    private deleteCase = async (request: express.Request, response: express.Response) => {

        //@ts-ignore 
        const currentUserId: number = Number(request.user.id); 

        const isCaseExist: boolean = await this.checkIsCaseExistsFromUser(request, response); 

        if(!isCaseExist) response.status(404).json({message: "Case exists!"}); 

        const sqlToGetCurrentCaseId = "SELECT * FROM cases WHERE user_id = $1"; 

        const result = await this.database.query(sqlToGetCurrentCaseId, [currentUserId]);

        const currentCaseId = result.rows[0].case_id; 

        const sqlToGetAllCaseProducts: string = "SELECT * FROM case_products WHERE case_id = $1"; 

        const sqlToDeleteCase: string = "DELETE FROM cases WHERE user_id = $1"; 

        const resultProductsInCase: QueryResult = await this.database.query(sqlToGetAllCaseProducts, [currentCaseId]); 

        console.log("Debug 1."); 

        if(resultProductsInCase.rowCount === 0) {

            console.log('Debug row count equals 0');
            
            await this.database.query(sqlToDeleteCase, [currentUserId]); 

            response.status(202).json({message: "Case deleted successfully!"}); 

        } else {

            const sqlToDeleteCaseProduct: string = "DELETE FROM case_products WHERE user_id = $1 AND product_id = $2"; 

            resultProductsInCase.rows.forEach( async (item: ProductResponse) => {
                
                await this.database.query(sqlToDeleteCaseProduct, [currentUserId, [item.product_id]])

            })

            await this.database.query(sqlToDeleteCase, [currentUserId]); 

            response.status(202).json({message: 'Case deleted successfully'}); 

        }

    }

    private createCase = async (request: express.Request, response: express.Response) => {

        const caseRequest: CaseRequest = request.body;

        //@ts-ignore
        const currentUserId: number = Number(request.user.id);

        const isCaseExist: boolean = await this.checkIsCaseExistsFromUser(request, response); 

        if(isCaseExist) response.status(404).json({message: "Case already exists!"}); 

        const sqlToCreateCase: string = "INSERT INTO cases(user_id) VALUES ($1) RETURNING *";

        const result: QueryResult = await this.database.query(sqlToCreateCase, [currentUserId]);

        const sqlToCreateCaseProduct: string = "INSERT INTO case_products(case_id, product_id, quantity) VALUES($1, $2, $3)";

        caseRequest.products.forEach(async (item: CaseRequestItem) => {

            await this.database.query(sqlToCreateCaseProduct, [result.rows[0].case_id, item.product_id, item.quantity]);

        });

        response.status(201).json({ message: 'Case created successfully!' });

    }

    private addProductsToCase = async (request: express.Request, response: express.Response) => {

        const productIds: Array<CaseRequestItem> = request.body; 

        //@ts-ignore 
        const currentUserId: number = Number(request.user.id); 

        const isCaseExist = await this.checkIsCaseExistsFromUser(request, response); 

        if(!isCaseExist) response.status(404).json({message: "Case doesn't exists"}); 

        const sqlToGetCaseByUserId: string = "SELECT * FROM cases WHERE user_id = $1"; 

        const result: QueryResult = await this.database.query(sqlToGetCaseByUserId, [currentUserId]); 

        const currentCaseId: number = Number(result.rows[0].case_id); 

        const sqlToCheckIsCaseProductsExists: string = "SELECT * FROM case_products WHERE case_id = $1 AND product_id = $2"; 

        const sqlToAddCaseProducts: string = "INSERT INTO case_products(case_id, product_id, quantity) VALUES ($1, $2, $3)"; 


        const sqlToUpdateCaseProduct: string = "UPDATE case_products SET quantity = $1 WHERE case_id = $1 AND product_id = $2"; 

        productIds.forEach( async (item: CaseRequestItem) => {

            const productWithId: QueryResult = await this.database.query(sqlToCheckIsCaseProductsExists, [currentCaseId, item.product_id]); 

            if(productWithId) {

                const quantity: number = productWithId.rows[0].quantity; 

                const sumOfQuantity: number = quantity + item.quantity; 

                console.log(sumOfQuantity);

                await this.database.query(sqlToUpdateCaseProduct, [currentCaseId, item.product_id]);

            } else {
                
                await this.database.query(sqlToAddCaseProducts, [currentCaseId, item.product_id, item.quantity]); 

            }

        })

        response.status(201).json({message: "Case's products updated!"}); 

    }

    private deleteProductFromCase = async (request: express.Request, response: express.Response) => {

        const productIds: Array<CaseRequestItem> = request.body; 

        //@ts-ignore 
        const currentUserId: number = Number(request.user.id); 

        const isCaseExist: boolean = await this.checkIsCaseExistsFromUser(request, response);

        if(!isCaseExist) response.status(404).json({message: "Case doesn't exists"}); 

        const sqlToGetOrderIdByCurrentUser: string = "SELECT * FROM cases WHERE user_id = $1"; 

        const result = await this.database.query(sqlToGetOrderIdByCurrentUser, [currentUserId]); 

        const currentCaseId = result.rows[0].case_id; 

        const sqlToDeleteProductInOrder: string = "DELETE FROM case_products WHERE case_id = $1 AND product_id = $2"; 

        const sqlToUpdateProductCase: string = "UPDATE case_products SET quantity = $1 WHERE case_id = $1 AND product_id = $2 RETURNING *"; 

        productIds.forEach( async (item: CaseRequestItem) => {

            const updatedValue: QueryResult = await this.database.query(sqlToDeleteProductInOrder, [currentCaseId, item.product_id]);

            //Delete product from case if quantity equals 0. 
            if(updatedValue.rows[0].quantity === 0) {
                await this.database.query(sqlToDeleteProductInOrder, [currentCaseId, item.product_id]); 
            } 

        })

        response.status(202).json({message: 'Deleted records successfully!'}); 

    }

    private checkIsCaseExistsFromUser = async (request: express.Request, response: express.Response) => {

        //@ts-ignore
        const currentUserId: number = Number(request.user.id); 

        const sqlToCheckIsUserExists: string = "SELECT * FROM cases WHERE user_id = $1"; 

        const result: QueryResult = await this.database.query(sqlToCheckIsUserExists, [currentUserId]); 

        if(result.rowCount === 0) return false;
        else return true;

    }

}

export default CaseController;