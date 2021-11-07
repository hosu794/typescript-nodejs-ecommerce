import { request, Request, Response, Router } from "express";
import Controller from "../interfaces/controller.interface";
import paypal, { payment } from 'paypal-rest-sdk'


class PaypalController implements Controller {

    constructor() {
        this.intitializeRoutes()
        paypal.configure({
            'mode': 'sandbox', 
            'client_id': 'AbzmQZsu4FwTLmPdcXGHAnuB_tTVGfiqR4A7YRxqHwEGqCN2gd6O6TNm2jATsk9k66a8taDagk6Iakyo', 
            'client_secret': 'EBW51RwRF9Oia36sBEvaD5BCSruH7ev6xjTGG8AWb6R4pj9oQJoCr2NeQDmdv7i3wRjHSYGagfW1_oxc'
        })
    }

    public readonly path: string = '/paypal'; 
    public router: Router = Router(); 

    private intitializeRoutes() {
        this.router.post(this.path, this.createPayment)
        this.router.get(`${this.path}/success`, this.successPayment)
        this.router.get(`${this.path}/cancel`, this.cancelPayment)
    }

    private successPayment = async (request: Request, response: Response) => {
        const payerId: any = request.query.PayerID;
        const paymentId: string = String(request.query.paymentId);

        const execute_payment_json = {
            "payer_id": payerId,
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": "25.00"
                }
            }]
          };

        
          paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
            //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
          if (error) {
              console.log(error.response);
              throw error;
          } else {
              console.log(JSON.stringify(payment));
              response.send('Success');
          }
      });

    }

    private cancelPayment = async (request: Request, response: Response) => {
        response.send("Cancelled!")
    }

    private createPayment = async (request: Request, response: Response) => {
        
        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/success",
                "cancel_url": "http://localhost:3000/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "Redhock Bar Soap",
                        "sku": "001",
                        "price": "25.00",
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": "25.00"
                },
                "description": "Washing Bar soap"
            }]
        };

        paypal.payment.create(create_payment_json, (error: any, payment: any) => {

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

}

export default PaypalController