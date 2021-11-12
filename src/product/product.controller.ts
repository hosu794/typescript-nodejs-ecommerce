import { Router } from "express";
import Controller from "../interfaces/controller.interface";

import express from 'express'; 

class ProductController implements Controller {
    public readonly path: string = "/product";  
    router: Router = express.Router(); 

    constructor() {}
    

    
}

export default ProductController; 