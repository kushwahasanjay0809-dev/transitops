const express = require('express');
const reportController = require('./report.controller');
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { reportDateRangeSchema, vehicleReportQuerySchema } = require('./report.validation');

const router = express.Router();

// All reports require authentication + ADMIN or MANAGER role
router.use(authenticate);
router.use(authorize('ADMIN', 'MANAGER'));

// Report endpoints (all support ?format=csv for CSV download)
router.get('/trips', validate(reportDateRangeSchema, 'query'), reportController.tripReport);
router.get('/expenses', validate(reportDateRangeSchema, 'query'), reportController.expenseReport);
router.get('/fuel', validate(reportDateRangeSchema, 'query'), reportController.fuelReport);
router.get('/vehicle-utilization', validate(vehicleReportQuerySchema, 'query'), reportController.vehicleUtilizationReport);

module.exports = router;
