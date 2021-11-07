
import PaypalController from './paypal/paypal.controller';
import App from './server'

const Application = new App([new PaypalController]);

