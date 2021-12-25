
import Pool from 'pg'; 

export interface Service {
    database: Pool.Pool;
}