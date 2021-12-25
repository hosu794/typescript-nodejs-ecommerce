

class AmountQuantityError extends Error {
    constructor(message: string) {
        super(message); 
        this.name = "AmountQuantityError"; 
    }
}

export default AmountQuantityError; 