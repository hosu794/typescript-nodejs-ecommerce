import Controller from "../interfaces/controller.interface";
import Pool, { QueryResult, QueryResultBase } from 'pg'; 

import express, { request } from 'express'; 
import DatabaseConnection from "../config/database";
import Token from "../authentication/authentication.middleware";
import { OrderProductRequest, OrderStatusRequest } from "./order.interfaces";

class OrderController implements Controller {

    constructor() {
        this.initializeRoutes(); 
        this.database = new DatabaseConnection().getDB(); 
    }

    public readonly path: string = "/orders"; 
    public router: express.Router = express.Router(); 
    private database: Pool.Pool;

    private initializeRoutes() {
        this.router.get(`${this.path}/current/user`, Token.verifyToken ,this.getOrdersByCurrentUser); 
        this.router.post(`${this.path}`, Token.checkRole(["USER", "ADMIN"]), this.addProductsToOrder); 
        this.router.post(`${this.path}/change/order/status/:id`, [Token.verifyToken, Token.checkRole(["ADMIN"])], this.changeOrderStatus); 
        this.router.get(`${this.path}/:id`, this.getOrderById);  
    }

    private getOrdersByCurrentUser = async (request: express.Request, response: express.Response) => {
        
        //@ts-ignore
        this.checkIfUserCurrentExists(response, request.user); 

        const sqlGetOrdersByUser: string = "SELECT * FROM orders WHERE user_id = $1"; 

        //@ts-ignore
        const { rows } = await this.database.query(sqlGetOrdersByUser, [Number(request.user.id)]); 

        response.status(200).json({orders: rows}); 
    }

    private getOrderById = async (request: express.Request, response: express.Response) => {

        const orderId: number = Number(request.params.id); 

        const sqlGetOrderByStatus: string = "SELECT * FROM orders WHERE order_id = $1"; 

        const result = await this.database.query(sqlGetOrderByStatus, [orderId]); 

        response.status(200).json({result: result.rows[0]}); 
        
    }

    private addProductsToOrder = async (request: express.Request, response: express.Response) => {

        //@ts-ignore
        this.checkIfUserCurrentExists(response, request.user); 

        const productsIds: Array<OrderProductRequest> = request.body; 

        const sqlToCreateOrder = "INSERT INTO orders(user_id, order_status, order_date, required_date, shipped_date) VALUES($1, $2, $3, $4, $5) RETURNING *"; 

        //@ts-ignore
        const result: QueryResult = await this.database.query(sqlToCreateOrder, [request.user.id, 0, new Date(), null, null]);
        
        //@ts-ignore
        const orderId = result.rows[0].order_id

        const sqlCreateOrderProduct = "INSERT INTO order_product(order_id, product_id, quantity) VALUES ($1, $2, $3)"; 

        productsIds.forEach( async (item: OrderProductRequest) => {

            await this.database.query(sqlCreateOrderProduct, [orderId, item.productId, item.quantity]); 

        });

        response.status(201).json({message: 'Order created successfully!'}); 

    }

    private changeOrderStatus = async (request: express.Request, response: express.Response) => {

        const orderStatusNumber: OrderStatusRequest = request.body; 

        const orderId: number = Number(request.params.id); 

        const sqlToChangeOrderStatus: string = "UPDATE orders SET order_status = $1 WHERE order_id = $2"; 

        const result: QueryResult = await this.database.query(sqlToChangeOrderStatus, [orderStatusNumber.status, orderId]);
        
        response.status(200).json({message: 'Order status has changed successfully'}); 

    }

    private checkIfUserCurrentExists = async (res: express.Response, currentUser: any) => {

        const sqlToCheckIsUserExists: string  = "SELECT * FROM users WHERE user_id = $1"; 

        const { rowCount } = await this.database.query(sqlToCheckIsUserExists, [currentUser.id]); 

        if(rowCount === 0) res.status(404).json({message: 'User not exists!'}); 
    }

}

export default OrderController; 