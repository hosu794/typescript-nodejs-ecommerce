import { Router } from "express";
import Controller from "../interfaces/controller.interface";

import express from 'express'; 
import DatabaseConnection from "../config/database";

import Token from "../authentication/authentication.middleware";
import { CategoryQueryResponse, CategoryRequest, CategoryResponse } from "./category.interfaces";

class CategoryController implements Controller {
    public readonly path: string = '/categories'; 
    router: Router = express.Router();

    database: any;

    constructor() {
        this.database = new DatabaseConnection().getDB();
        this.initializeControllers();  
    }

    private initializeControllers() {
        this.router.get(`${this.path}`, Token.checkRole(['ADMIN', 'USER']),  this.getAllCategories); 
        this.router.get(`${this.path}/:id`,Token.checkRole(['ADMIN', 'USER'])  ,this.getCategoryById); 
        this.router.post(`${this.path}`, Token.checkRole(['ADMIN', 'USER']), this.createCategory); 
        this.router.put(`${this.path}/:id`, Token.checkRole(['ADMIN', 'USER']), this.updateCategory); 
        this.router.delete(`${this.path}/:id`, Token.checkRole(['ADMIN', 'USER']), this.deleteCategory); 
    }

    getAllCategories = async (request: express.Request, response: express.Response) => {

        const sqlQuery: string = "SELECT * FROM categories"; 

        const { rows: categories } = await this.database.query(sqlQuery); 

        response.json({categories}); 

    }

    getCategoryById = async (request: express.Request, response: express.Response) => {

        const categoryId: number = Number(request.params.id); 

        const sqlQuery: string = "SELECT * FROM categories WHERE category_id = $1"; 

        const results: any  = await this.database.query(sqlQuery, [categoryId]);

        response.json({
            record: results.rows[0]
        })

    }

    createCategory = async (request: express.Request, response: express.Response) => {
        const categoryRequest: CategoryRequest = request.body;
        const sqlQueryToCheckIsExists: string = "SELECT * FROM categories WHERE title = $1"; 

        const {rowCount}: CategoryQueryResponse = await this.database.query(sqlQueryToCheckIsExists, [categoryRequest.title]); 

        if(rowCount > 0) response.status(401).json({message: 'Category with this title is exists!'}); 

        const sqlQueryToCreateCategory: string = "INSERT INTO categories(title) VALUES($1)";

        await this.database.query(sqlQueryToCreateCategory, [categoryRequest.title]); 

        response.json({message: 'Category created successfully!'}); 
    }

    updateCategory = async (request: express.Request, response: express.Response) => {
        
        const categoryUpdateRequest: CategoryRequest = request.body;
        
        const categoryId = Number(request.params.id);

        if(!categoryId && typeof categoryId !== "number") response.sendStatus(401).json({message: 'Wrong request params!'});  

        const sqlRequestToCheckIfExists = "SELECT * FROM categories WHERE category_id = $1"; 

        const results: any = await this.database.query(sqlRequestToCheckIfExists, [categoryId]); 

        if(results.rowCount === 0) response.sendStatus(404).json({message: "Not found!"});

        const sqlQueryToUpdateCategory: string = "UPDATE categories SET title = $1 WHERE category_id = $2"; 
    
        await this.database.query(sqlQueryToUpdateCategory, [categoryUpdateRequest.title, categoryId]);     

        response.json({message: 'Record has updated successfully'}); 

    }

    deleteCategory = async (request: express.Request, response: express.Response) => {
    
        const categoryId = Number(request.params.id);

        if(!categoryId && typeof categoryId === 'number') response.sendStatus(401).json({message: 'Wrong request params!'}); 

        const sqlRequestToCheckIfExists = "SELECT * FROM categories WHERE category_id = $1"; 

        let results: any = await this.database.query(sqlRequestToCheckIfExists, [categoryId]);

        if(results.rowCount === 0) response.status(404).json({message: 'Category not found!'}); 

        const sqlQueryToDeleteRequest: string = "DELETE FROM categories WHERE category_id = $1"; 

        await this.database.query(sqlQueryToDeleteRequest, [categoryId]);

        response.json({message: 'Record has deleted successfully'}); 

    }



}

export default CategoryController; 