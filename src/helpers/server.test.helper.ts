import supertest from 'supertest'

import server from '../app'; 

let requestWithSupertest: supertest.SuperTest<supertest.Test>; 

requestWithSupertest = supertest(server.getServer());

export default requestWithSupertest;