
import Pool from 'pg'

export interface IDatabaseConnection {
     db: Pool.Pool; 
}