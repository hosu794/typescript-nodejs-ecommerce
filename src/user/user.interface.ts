import { isNumber, IsString, isString } from 'class-validator'

interface User {
    id: number; 
    firstName: string;
    lastName: string; 
    emai: string; 
    password: string; 
}

export class UserRequest {
    @IsString()
    public firstname: string;
    @IsString() 
    public lastname: string; 
    
    @IsString() 
    public nickname: string;
    
    @IsString()
    public password: string;
    
    @IsString()
    public country: string; 

    @IsString()
    public province: string; 

    @IsString()
    public city: string; 

    @IsString()
    public street: string; 

    @isNumber()
    public street_number: number; 

    @IsString()
    public post_code: string; 
}
