const { validationResult } = require('express-validator/check');

const Product = require('../models/product');

const fileHelper = require('../util/file');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', { 
        pageTitle: 'Add Product', 
        path:'/admin/add-product',
        editing: false,
        hasError: false,
        isLoggedIn: req.session.isLoggedIn,
        errorMessage: null,
        validationErrors: []
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    const errors = validationResult(req) ;

    if (!image) {
        return res.status(422).render('admin/edit-product', { 
            pageTitle: 'Add Product', 
            path:'/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description
            },
            isLoggedIn: req.session.isLoggedIn,
            errorMessage: 'Attached file is not an image',
            validationErrors: []
        })
    }

    const imageUrl = image.path;
    
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', { 
            pageTitle: 'Add Product', 
            path:'/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                imageUrl: imageUrl,
                price: price,
                description: description
            },
            isLoggedIn: req.session.isLoggedIn,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()

    })
}

    const product = new Product({
        title: title, 
        price: price, 
        description: description, 
        imageUrl: imageUrl, 
        userId:  req.user,
        isLoggedIn: req.session.isLoggedIn
    });
    product.save()      
        .then(result => {
            console.log('Data created');
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
    
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            if(!product) {
                return res.redirect('/');
            }       
            res.render('admin/edit-product', { 
                pageTitle: 'Edit Product', 
                path:'/admin/edit-product',
                editing: editMode,
                product: product,
                hasError: false,
                isLoggedIn: req.session.isLoggedIn,
                errorMessage: null,
                validationErrors: []
            });
        })
        .catch(err => console.log(err))    
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle =req.body.title;
    const updatedPrice =req.body.price;
    const image =req.file;
    const updatedDescription =req.body.description;
    const errors = validationResult(res);
    

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', { 
            pageTitle: 'Edit Product', 
            path:'/admin/edit-product',
            editing: true,
            hasError: true,
            product: {
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDescription,
                _id: prodId
            },
            isLoggedIn: req.session.isLoggedIn,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()

        })
    }
    Product.findById(prodId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/')
            }
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDescription;
            if (image) {
                fileHelper.deleteFile(product.imageUrl);
                product.imageUrl = image.path;
            }           
            return product.save().then(result => {
                console.log('UPDATED PRODUCT')
                res.redirect('/admin/products');
            })      
        })
        .catch(err => console.log(err));
};

exports.deleteProduct = (req, res, next) => {
    const prodId = req.body.prodId;
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return next(new Error('Product not found.'))
            }
            fileHelper.deleteFile(product.imageUrl);
            return Product.deleteOne({_id:prodId, userId: req.user._id})
        })
        .then(() => {
            res.status(200).json({message: 'Success!'})
        })
        .catch(err => {
            res.status(500).json({message: 'Failed!'})
        }); 
}

exports.getProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
        .then(products => {
            res.render('admin/products', {
                path: '/admin/products', 
                prods: products,
                pageTitle: 'Admin Products',
                isLoggedIn: req.session.isLoggedIn 
            })
        })
        .catch(err => console.log(err))    
}