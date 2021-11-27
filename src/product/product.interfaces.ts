export interface ProductRequest {
    name: string;
    modelYear: number; 
    price: number; 
}

export interface ProductResponse {
    product_id: number; 
    name: string; 
    category_id: string; 
    model_year: string; 
    price: string; 
}