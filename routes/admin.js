const express = require('express');
const { body } = require('express-validator/check')


// const rootDir = require('../util/path')
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/
router.get('/add-product',
[
    body('title')
        .isString()
        .isAlphanumeric()
        .isLength({min:3})
        .trim(),
    body('price').isFloat(),
    body('description')
        .isLength({min:5, max: 400})
        .trim(),
        
], isAuth, adminController.getAddProduct);
router.post('/add-product',
[
    body('title')
        .isString()
        .isAlphanumeric()
        .isLength({min:3})
        .trim(),
    body('price').isFloat(),
    body('description')
        .isLength({min:5, max: 400})
        .trim(),
        
], isAuth, adminController.postAddProduct);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post('/edit-product',
[
    body('title')
        .isString()
        .isAlphanumeric()
        .isLength({min:3})
        .trim(),
    body('price').isFloat(),
    body('description')
        .isLength({min:5, max: 400})
        .trim(),
        
], isAuth, adminController.postEditProduct);
router.get('/products', isAuth, adminController.getProducts);
router.delete('/product/:productId', isAuth, adminController.deleteProduct);

exports.routes = router;