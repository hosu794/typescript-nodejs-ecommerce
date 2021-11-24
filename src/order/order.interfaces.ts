export interface OrderProductRequest {
    productId: number; 
    quantity: number; 
}

export interface OrderStatusRequest {
    status: OrderStatusEnum;
}

export enum OrderStatusEnum {
    PENDING = 0, 
    AWAITING_PAYMENT = 1, 
    AWAITING_PICKUP = 2, 
    COMPLETED = 3,
    SHIPPED = 4,  
    DECLINED = 5
}