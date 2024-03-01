const express = require('express');
const router = express.Router();
router.use(express.json());

const requestService = require('../service/RequestService');

// Create Request
router.post('/create', async (req, res, next) => {
    try {
        const data = await requestService.createRequest(req.body);
        if(data) res.status(201).json({ message: 'Request created successfully', data });
        else res.status(400).json({message: `Request with with that id already exists`, data: req.body});
        next();
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Process Request
router.post('/process', async (req, res, next) => {
    try {
        const data = await requestService.processRequest(req.body);
        res.status(200).json({ message: 'Request processed successfully', data });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// View Request Queue
router.get('/queue', async (req, res, next) => {
    try {
        const data = await requestService.viewRequestQueue();
        res.status(200).json({ message: 'Request queue retrieved successfully', data });
    } catch (error) {
        console.error('Error retrieving request queue:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// View Requests by Account
router.get('/view', async (req, res, next) => {
    try {
        const data = await requestService.getRequestByAccount(req.body);
        res.status(200).json({ message: 'Requests retrieved successfully', data });
    } catch (error) {
        console.error('Error retrieving requests by account:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
