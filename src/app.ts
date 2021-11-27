
import AuthenticationController from './authentication/authentication.controller';
import CaseController from './case/case.controller';
import CategoryController from './category/category.controller';
import OrderController from './order/order.controller';
import PaypalController from './paypal/paypal.controller';
import ProductController from './product/product.controller';
import App from './server'
import UserController from './user/user.controller';


const Application = new App([new ProductController,new CategoryController, new PaypalController, new UserController, new AuthenticationController, new CategoryController, new OrderController, new CaseController]);

