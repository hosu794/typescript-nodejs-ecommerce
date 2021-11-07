
import Pool from 'pg'

 interface DatabaseConnectionInterface {
     db: Pool.Pool; 
}

export default DatabaseConnectionInterface