import { Router } from "express";
import Controller from "../interfaces/controller.interface";

import express from 'express'; 
import DatabaseConnection from "../config/database";

import Pool from 'pg'

class CategoryController implements Controller {
    public readonly path: string = '/categories'; 
    router: Router = express.Router();

    database: any;

    constructor() {
        this.database = new DatabaseConnection().getDB();
        this.initializeControllers();  
    }

    private initializeControllers() {
        this.router.get(`${this.path}`, this.getAllCategories); 
        this.router.get(`${this.path}/:id`, this.getCategoryById); 
    }

    getAllCategories = async (request: express.Request, response: express.Response) => {

    const sqlQuery: string = "SELECT * FROM categories"; 

    const { rows } = await this.database.query(sqlQuery); 

    if(rows) {
        response.sendStatus(200).json({
            categories: rows
        })
    } else {

        response.sendStatus(401).json({message: 'Categories not found!'}); 

    }

    }

    getCategoryById = async (request: express.Request, response: express.Response) => {

        const userId: number = Number(request.params.id); 

        const sqlQuery: string = "SELECT * FROM categories WHERE category_id = $1"; 

        const result  = await this.database(sqlQuery, [userId]);

        console.log(result); 

    }

}

export default CategoryController; 