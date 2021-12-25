import paypal from 'paypal-rest-sdk'

class PaypalRestApiConfig {

    private paypal: string; 

    constructor() {
        this.paypal = paypal.configure({
            'mode': 'sandbox', 
            'client_id': 'AbzmQZsu4FwTLmPdcXGHAnuB_tTVGfiqR4A7YRxqHwEGqCN2gd6O6TNm2jATsk9k66a8taDagk6Iakyo', 
            'client_secret': 'EBW51RwRF9Oia36sBEvaD5BCSruH7ev6xjTGG8AWb6R4pj9oQJoCr2NeQDmdv7i3wRjHSYGagfW1_oxc'
        })
    }

    public getPayPalApi(): any {
        return this.paypal;
    }


}

export default PaypalRestApiConfig