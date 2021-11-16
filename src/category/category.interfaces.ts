
export interface CategoryRequest {
    title: string; 
}

export interface CategoryResponse {
    category_id: number, 
    title: string;
}

export interface CategoryQueryResponse {
    results: Array<CategoryResponse>;
    rowCount: number;
    error?: any; 
}

