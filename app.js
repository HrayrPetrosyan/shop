const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const session =require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const MONGODB_URI = 'mongodb+srv://Hrayr:1gohardlikePutin!@cluster0-dl25r.mongodb.net/shop?retryWrites=true';

const store = new MongoDBStore({
  uri: MONGODB_URI,
  colection: 'session'
});
const csrfProtection = csrf();

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');
const shopController = require('./controllers/shop');
const isAuth = require('./middleware/is-auth');


const rootDir = require('./util/path');
// const expressHbs = require('express-handlebars');
const User = require('./models/user')

// const mongoConnect = require('./util/database').mongoConnect;
const mongoose = require('mongoose');

app.set('view engine', 'ejs');
// app.set('views', 'views');


const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images')
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname)
  }
})
const fileFilter = function (req, file, cb) {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

// {dest:'images'}
// {storage: fileStorage, fileFilter: fileFilter}
app.use(bodyParser.urlencoded({extended:false}));
app.use(
  multer({storage: fileStorage, fileFilter: fileFilter}).single('image')
  );
app.use(express.static(path.join(rootDir, 'public')));
app.use('/images', express.static(path.join(rootDir, 'images')));
app.use(
  session({ secret: 'my secret', resave: false, saveUninitialized: false, store: store })
)


app.use((req, res, next) => {
  if (!req.session.user) {
    return next()
  }
  User.findById(req.session.user._id)
  .then(user => {
    if (!user) {
      return next()
    }
      req.user = user;
      next();
  })
  .catch(err => {throw new Error(err)})
})

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;
  next();
})

app.use(flash());

app.post('/create-order', isAuth, shopController.postOrder);

app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
})

app.use('/admin', adminRoutes.routes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

// app.use((error, req, res, next) => {
//   // res.status(error.httpStatusCode).render(...);
//   // res.redirect('/500');
//   res.status(500).render('500', {
//     pageTitle: 'Error!',
//     path: '/500',
//     isAuthenticated: req.session.isLoggedIn
//   });
// });

mongoose
  .connect(
    MONGODB_URI
  )
  .then(result => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });