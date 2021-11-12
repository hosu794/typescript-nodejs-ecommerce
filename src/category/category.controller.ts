import { Router } from "express";
import Controller from "../interfaces/controller.interface";

import express from 'express'; 

class CategoryController implements Controller {
    public readonly path: string = '/categories'; 
    router: Router = express.Router();
    

}