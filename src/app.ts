
import AuthenticationController from './authentication/authentication.controller';
import CategoryController from './category/category.controller';
import PaypalController from './paypal/paypal.controller';
import App from './server'
import UserController from './user/user.controller';


const Application = new App([new CategoryController, new PaypalController, new UserController, new AuthenticationController, new CategoryController]);


