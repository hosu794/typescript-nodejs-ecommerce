
import AuthenticationController from './authentication/authentication.controller';
import PaypalController from './paypal/paypal.controller';
import App from './server'
import UserController from './user/user.controller';

const Application = new App([new PaypalController, new UserController, new AuthenticationController]);


