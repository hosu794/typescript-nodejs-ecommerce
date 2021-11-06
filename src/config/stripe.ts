import Stripe from 'stripe';

class StripeConfiguration {

    private secret_key: string = "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"

    private stripe: any; 

    constructor() {
        this.stripe = new Stripe(this.secret_key, {
            apiVersion: '2020-08-27'
        })
    }

    public createCustomer = async () => {
        const params: Stripe.CustomerCreateParams = {
            description: 'test customer'
        }

        const customer: Stripe.Customer = await this.stripe.customers.create(params)
        console.log(customer.id)
    }

}

const stripeConfiguration = new StripeConfiguration()

stripeConfiguration.createCustomer()