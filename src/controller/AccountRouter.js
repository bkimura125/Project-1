const express = require('express');
const router = express.Router();
router.use(express.json());
const logger = require("../util/Logger");

const accountService = require('../service/AccountService');

//Create Account
router.post('/register', async (req, res, next) => {
    try{
        const data = await accountService.createAccount(req.body);
        if(data) res.status(201).json({message: `Account creation success`, data: req.body});
        else res.status(400).json({message: `Username taken`, data: req.body});
        next();
    } catch (error){
        logger.error(`Error adding data to the database:`, error);
        res.status(400).json({message: `Account creation failed`, data: req.body});
        next();
    }
});

//Login
router.post('/login', async (req, res, next) => {
    try{
        const data = await accountService.login(req.body);
        if(data !== null) res.status(201).json({message: `Login successful`, data});
        else res.status(400).json({message: `Login failed`, data: req.body});
        next();
    } catch (error){
        logger.error(`Error logging in:`, error);
        res.status(400).json({message: `Login failed`, data: req.body});
        next();
    }
});

//Logout
router.post('/logout', async (req, res, next) => {
    try{
        const data = await accountService.logout(req.body);
        if(data) res.status(201).json({message: `Logout successful`, data: req.body});
        else res.status(400).json({message: `User not logged in`, data: req.body});
        next();
    } catch (error){
        logger.error(`Error logging out:`, error);
        res.status(400).json({message: `Logout failed`, data: req.body});
        next();
    }
});

module.exports = router;