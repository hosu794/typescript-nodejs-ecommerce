import express, { NextFunction } from 'express'; 
import { QueryResult } from 'pg';
import Controller from "../interfaces/controller.interface";
import Pool from 'pg'; 
import DatabaseConnection from '../config/database';
import paypal, { Item, order, payment, Payment, payment as PaypalPayment } from 'paypal-rest-sdk'

import { ProductResponse } from '../product/product.interfaces'; 
import { PaymentCredentials } from './payment.interface';
import { OrderStatusEnum } from '../order/order.interfaces';

class PaymentController implements Controller {
    public readonly path: string = "/payments"; 
    public router: express.Router = express.Router(); 
    database: Pool.Pool;

    constructor() {
        this.initializeRoutes();
        this.database = new DatabaseConnection().getDB(); 
    }

    private initializeRoutes() {

        this.router.post(`${this.path}/order/:id`, this.createPayment);
        this.router.get(`${this.path}/success`, this.successPayment); 

    }

    private createPayment = async (request: express.Request, response: express.Response, next: NextFunction) => {

        const orderId: number = Number(request.params.id); 

        const sqlToGetOrderById: string = "SELECT * FROM orders WHERE order_id = $1"; 
        
        const resultOfOrder: QueryResult = await this.database.query(sqlToGetOrderById, [orderId]);
        
        if(resultOfOrder.rowCount === 0) response.status(404).json({message: "Order not found!"}); 

        const sqlToGetAllProducts: string = "SELECT * FROM products JOIN order_product on products.product_id = order_product.product_id WHERE order_id = $1";
        
        const resultOfProducts: QueryResult = await this.database.query(sqlToGetAllProducts, [orderId]);
        
        let totalValueToPay: number = 0; 

        resultOfProducts.rows.map((item: ProductResponse) =>  {
            totalValueToPay = totalValueToPay + Number(item.price); 
        }); 

        const create_payment: Payment = {
            intent: 'sale', 
            payer: {
                payment_method: 'paypal'
            },
            redirect_urls: {
                return_url: `http://localhost:5000/payments/success?currency=USD&total=${String(totalValueToPay)}&orderId=${orderId}`, 
                cancel_url: "http://localhost:5000/payments/cancel"
            },
            transactions: [{
                amount: {
                    currency: "USD", 
                    total: String(totalValueToPay)
                },
                description: "Current Case"
            }]
        }

        paypal.payment.create(create_payment, (error: any, payment: any) => {

            if (error) {
                throw error;
            } else {
                for(let i = 0;i < payment.links.length;i++){
                  if(payment.links[i].rel === 'approval_url'){
                    response.redirect(payment.links[i].href);
                  }
                }
            }
        })

    }

    private successPayment = async (request: express.Request, response: express.Response) => {
      
        const payerId: any = request.query.PayerID;
        const paymentId: string = String(request.query.paymentId);

        const currency: string = String(request.query.currency); 
        const total: number = Number(request.query.total); 
        const orderId: number = Number(request.query.orderId); 

        const execute_payment_json = {
            "payer_id": payerId,
          };
        
          paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
            //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
          if (error) {
              console.log(error.response);
              throw error;
          } else {

            const sqlToCreatePayment: string = "INSERT INTO payments(currency, total, order_id) VALUES ($1, $2, $3)"; 
            
            await this.database.query(sqlToCreatePayment, [currency, total, orderId]); 
            
            const sqlToUpdateOrder: string = "UPDATE orders SET order_status = $1 WHERE order_id = $2"; 
            await this.database.query(sqlToUpdateOrder, [OrderStatusEnum.AWAITING_PICKUP, orderId]); 

            response.send('Payment has created successfully.');
          }
      });

    }

    private cancelPayment = async (request: express.Request, response: express.Response) => {
        response.send("Cancelled!"); 
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

export default PaymentController; 