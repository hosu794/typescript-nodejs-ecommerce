import { Router } from "express";
import Controller from "../interfaces/controller.interface";

import express from 'express'; 
import { ProductRequest } from "./product.interfaces";
import DatabaseConnection from "../config/database";
import Token from "../authentication/authentication.middleware";

class ProductController implements Controller {
    public readonly path: string = "/products";  
    router: Router = express.Router(); 

    constructor() {
        this.initializeRoutes(); 
    }

    initializeRoutes = () => {
        this.router.post(`${this.path}/:id`, [Token.verifyToken, Token.checkRole(["ADMIN"])] , this.createProduct); 
        this.router.get(`${this.path}`, [Token.verifyToken, Token.checkRole(["ADMIN"])], this.getAllProducts); 
        this.router.get(`${this.path}/:id`, [Token.verifyToken, Token.checkRole(["ADMIN"])], this.getProductById);
        this.router.put(`${this.path}/:id`, [Token.verifyToken, Token.checkRole(["ADMIN"])], this.updateProduct); 
        this.router.delete(`${this.path}/:id`, [Token.verifyToken, Token.checkRole(["ADMIN"])], this.deleteProduct); 
        this.router.get(`${this.path}/categories/:id`, this.getProductsByCategoryId); 
    }

    getAllProducts = async (request: express.Request, response: express.Response) => {
        const database = new DatabaseConnection().getDB(); 

        const sqlToGetAllProducts: string = "SELECT * FROM products"; 

        const { rows } = await database.query(sqlToGetAllProducts); 

        response.json({products: rows}); 

    }

    getProductById = async (request: express.Request, response: express.Response) => {

        const productId: number = Number(request.params.id); 

        const database = new DatabaseConnection().getDB(); 

        const sqlGetById: string = "SELECT * FROM products WHERE product_id = $1"; 

        const { rows, rowCount } = await database.query(sqlGetById, [productId]); 

        if(rowCount === 0) response.sendStatus(404).json({ message: "Product id not found!" });
        
        response.json({item: rows});

    }
    
    createProduct = async (request: express.Request, response: express.Response) => {

        const database = new DatabaseConnection().getDB();  

        const product: ProductRequest = request.body;

        console.log("Body", request.body); 

        const categoryId: number = Number(request.params.id); 

        const sqlToCheck: string = "SELECT * FROM categories WHERE category_id = $1"; 

        const { rowCount } = await database.query(sqlToCheck, [categoryId]); 

        if(rowCount === 0) response.status(404).json({message: "Category not found!"}); 

        const sqlToCreateProduct: string = "INSERT INTO products(name, category_id, model_year, price) VALUES($1, $2, $3, $4)"; 

        await database.query(sqlToCreateProduct, [product.name, categoryId, product.modelYear, product.price]); 

        response.json({message: 'Product has created successfully!'}); 

    }

    updateProduct = async (request: express.Request, response: express.Response) => {

        const database = new DatabaseConnection().getDB();

        const product: ProductRequest = request.body; 

        const productId = Number(request.params.id); 

        const sqlToCheck: string = "SELECT * FROM products WHERE product_id = $1"; 

        const { rowCount, rows } = await database.query(sqlToCheck, [productId]); 

        if(rowCount === 0) response.status(404).json({message: "Product didn't exists"}); 

        const sqlToUpdate: string = "UPDATE products SET name = $1, model_year = $2, price = $3 WHERE product_id = $4";

        console.log(sqlToUpdate); 

        await database.query(sqlToUpdate, [product.name, product.modelYear, product.price, productId]);
        
        response.json({message: 'Product has been updated.'}); 

    }

    deleteProduct = async (request: express.Request, response: express.Response) => {

        const database = new DatabaseConnection().getDB(); 

        const productId = Number(request.params.id); 

        const sqlRequestToCheckIfExists = "SELECT * FROM products WHERE product_id = $1"; 

        let results: any = await database.query(sqlRequestToCheckIfExists, [productId]);

        if(results.rowCount === 0) response.status(404).json({message: 'Product not found!'});
   
        const sqlToDeleteSql: string = "DELETE FROM products WHERE product_id = $1"; 

        await database.query(sqlToDeleteSql, [productId]);

        response.json({message: 'Record has deleted successfully'}); 
    }

    getProductsByCategoryId = async (request: express.Request, response: express.Response) => {
        
        const database = new DatabaseConnection().getDB(); 

        const categoryId = Number(request.params.id); 

        const sqlRequestToCheckIfCategoryExists = "SELECT * FROM categories WHERE category_id = $1"; 

        let results: any = await database.query(sqlRequestToCheckIfCategoryExists, [categoryId]); 

        if(results.rowCount === 0) response.status(404).json({message: 'Category not exsits!'}); 

        const sqlToFetchProductsByCategoryId: string = "SELECT * FROM products WHERE category_id = $1"; 

        const { rows } = await database.query(sqlToFetchProductsByCategoryId, [categoryId]);

        response.status(200).json({products: rows}); 

    }

}

export default ProductController; 