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
        this.router.post(`${this.path}`, [Token.verifyToken, Token.checkRole(["USER"])], this.addProductsToOrder); 
        this.router.post(`${this.path}/change/order/status`, [Token.verifyToken, Token.checkRole(["ADMIN"])], this.changeOrderStatus); 
        this.router.get(`${this.path}/:id`, this.getOrderStatusById);  
    }

    private getOrdersByCurrentUser = async (request: express.Request, response: express.Response) => {
        
        this.checkIfUserCurrentExists(response);
        
        const sqlGetOrdersByUser: string = "SELECT * FROM orders WHERE user_id = $1"; 

        const { rows } = await this.database.query(sqlGetOrdersByUser, [sqlGetOrdersByUser]); 

        response.status(200).json({orders: rows}); 
    }

    private getOrderStatusById = async (request: express.Request, response: express.Response) => {

        const orderId: number = Number(request.params.id); 

        const sqlGetOrderByStatus: string = "SELECT * FROM orders WHERE order_id = $1"; 

        const result = await this.database.query(sqlGetOrderByStatus, [orderId]); 

        response.status(200).json({result: result.rows[0]}); 
        
    }

    private addProductsToOrder = async (request: express.Request, response: express.Response) => {

        this.checkIfUserCurrentExists(response); 

        const productsIds: Array<OrderProductRequest> = request.body; 

        const sqlToCreateOrder = "INSERT INTO orders(user_id, order_status, order_date, required_date, shipped_date) VALUES($1, $2, $3, $4, $5)"; 

        //@ts-ignore
        const result: QueryResult = await this.database.query(sqlToCreateOrder, [request.user, 0, new Date(), null, null]);

        const orderId = result.rows[0].id; 

        const sqlCreateOrderProduct = "INSERT order_product(order_id, product_id, quantity) VALUES ($1, $2, $3)"; 

        productsIds.forEach( async (item: OrderProductRequest) => {

            await this.database.query(sqlToCreateOrder, [orderId, item.productId, item.quantity]); 

        });

        response.send(200).json({message: 'Order created successfully!'}); 

    }

    private changeOrderStatus = async (request: express.Request, response: express.Response) => {

        const orderStatus: OrderStatusRequest = request.body; 

        const sqlToChangeOrderStatus: string = "UPDATE orders SET order_status = $1"; 

        const result: QueryResult = await this.database.query(sqlToChangeOrderStatus, [orderStatus.orderStatusNumber]);
        
        response.status(200).json({message: 'Order status has changed successfully'}); 

    }

    private checkIfUserCurrentExists = async (res: express.Response) => {
        //@ts-ignore
        const currentUserId: number = Number(request.user); 

        const sqlToCheckIsUserExists: string  = "SELECT * FROM users WHERE user_id = $1"; 

        const { rowCount } = await this.database.query(sqlToCheckIsUserExists, [currentUserId]); 

        if(rowCount === 0) res.status(404).json({message: 'User not exists!'}); 
    }

}

export default OrderController; 