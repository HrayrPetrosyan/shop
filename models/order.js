const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    products: [{
        product: {type: Object, required: true },
        quantity: { type: Number, required: true}
    }],
    user: {
        email: {
            type: String,
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }
    }
});

module.exports = mongoose.model('Order', orderSchema)

// addOrder() {
    //         const db = getDb();
    //         return this.getCart()
    //             .then(products => {
    //                 const order = {
    //                     items: products,
    //                     user: {
    //                         _id: new mongodb.ObjectId(this._id),
    //                         name: this.name
    //                     }
    //                 }
    //                 return db.collection('orders').insertOne(order);
    //             })       
    //             .then(result => {
    //                 this.cart = {items: []};
    //                 return db.collection('users').updateOne(
    //                     {_id: new mongodb.ObjectId(this._id)},
    //                     {$set: {cart: {items: [] }}}
    //                 )
    //             })
    //     }