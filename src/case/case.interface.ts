
export interface CaseRequest {

    products: Array<CaseRequestItem>; 

}

export interface CaseRequestItem {
    product_id: number; 
    quantity: number; 
}

export interface CaseRequestProductIds {
    productsIds: Array<Number>; 
}