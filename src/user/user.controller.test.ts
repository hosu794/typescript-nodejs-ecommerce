import UserController from "./user.controller";

import express from 'express'; 

import supertest from 'supertest'; 

import server from '../app'; 

const requestWithSupertest = supertest(server.getServer());

describe('user controller', () => {

    it('should resolve with true', async () => {

    });

})