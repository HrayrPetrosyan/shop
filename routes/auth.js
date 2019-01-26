const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();

const { check, body } = require('express-validator/check')

const authController = require('../controllers/auth');
const User = require('../models/user')

let userEmail;

router.get('/login', authController.getLogin );
router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail()
    .custom((value, {req}) => {
        return User.findOne({email:value})
            .then(user => {
                userEmail = value;
                if (!user) {
                    return Promise.reject('Invalid email')
                }                        
            })
    }),
    body('password').isAlphanumeric().withMessage('Please enter a password with only numbers and text and at least 5 charachters')
        .isLength({min:5}).withMessage('Please enter a password with only numbers and text and at least 5 charachters')
        .trim()
        .custom((value, {req}) => {
            return User.findOne({email:userEmail})
            .then(user => {
                return bcrypt.compare(value, user.password)
                    .then(doMatch => {
                        if (!doMatch) {
                            return Promise.reject('Wrong password!')
                        }
                    })
            })
        }),
    ], authController.postLogin );
router.post('/logout', authController.postLogout );
router.get('/signup', authController.getSignUp);
router.post('/signup',
[
    check('email').isEmail().withMessage('Please enter a valid email')
        .normalizeEmail()
        .custom((value, {req}) => {
            return User.findOne({email: value})
                .then (userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email already exists')
                    }
                })
            }),
    body('password', 'Please enter a password with only numbers and text and at least 5 charachters')
        .trim()
        .isAlphanumeric()
        .isLength({min:5}),
    body('confirmPassword')
        .trim()    
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match')
            }
            return true
        })
],
    authController.postSignUp);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;