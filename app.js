let express = require('express');
let app = express();
let mongoose = require('mongoose');
let Post = require ('./models/posts').Post;
let multer = require('multer');
let path = require('path');
let uniqid = require('uniqid');
let User = require ('./models/users').User;
let bcrypt = require('bcrypt');
let auth = require('./controllers/auth');
let cookieParser = require('cookie-parser');
let authMiddleware = require('./middleware/auth');

// let callbackRequestsRouter = require('./routes/callback-requests');

let CallbackRequest = require('./models/callback-requests').CallbackRequest;
let Email = require('./models/emails').Email;

app.set('view engine', 'ejs');
// let uniqid = require('uniqid');
// let express = require('express');

// let cr = new CallbackRequest({
//     id: '1234',
//     phoneNumber: '+1111111111',
//     date: new Date()
// });
// cr.save();

console.log(uniqid());

mongoose.connect('mongodb://localhost/travels', { useNewUrlParser: true });
app.use(express.json());
let imageStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/images'),
    filename: (req, file, cb) => cb(null, file.originalname)
})

app.use(multer({storage: imageStorage}).single('imageFile'));
app.use(cookieParser());

// let id = 1;

// let post1 = new Post({
//     id: 2,
//     title: 'Thank U God',
//     date: new Date(),
//     description: 'some text',
//     text: 'Some text',
//     country: 'India',
//     imageURL: '/images/1.jpg',
// });

// post1.save();

app.get('/posts', async (req, resp)=>{
    let posts = await Post.find();
    resp.send(posts);
})

app.get('/posts/:id', async (req, resp)=>{
    let id = req.params.id;
    let post = await Post.findOne({id: id});
    resp.send(post);
})

app.post('/posts', authMiddleware, async (req, resp)=>{
    let reqBody = req.body;
    let imgPath;
    if(reqBody.imageUrl){
        imgPath = reqBody.imageUrl;
    } else{
        imgPath = req.file.path.substring(req.file.path.indexOf(path.sep), req.file.path.length);
    }

    let newPost  = new Post({
        id: uniqid(),
        title: reqBody.title,
        date: new Date(),
        description: reqBody.description,
        text: reqBody.text,
        country: reqBody.country,
        // imageURL: reqBody.imageUrl
        imageURL: imgPath
    })
    // console.log(req.file);
    await newPost.save();
    resp.send('Created')
})

app.delete('/posts/:id', authMiddleware, async (req, resp)=>{
    let id = req.params.id;
    await Post.deleteOne({id: id});
    resp.send('Deleted!')
})

app.put('/posts/:id', authMiddleware, async (req, resp) => {
    let id = req.params.id;
    await Post.updateOne({id: id}, req.body);
    resp.send('Updated!');
})



app.use(express.static('public'));
// app.use('/callback-requests', callbackRequestsRouter);

app.get('/callback-requests', async (req, resp) => {
    resp.send(await CallbackRequest.find());
});
app.post('/callback-requests', authMiddleware, async (req, resp) => {
    let reqBody = req.body;
    let newRequest = new CallbackRequest({
        id: uniqid(),
        phoneNumber: reqBody.phoneNumber,
        date: new Date()
    }) 
    await newRequest.save()
    resp.send('Accepted');
});
app.delete('/callback-requests/:id', authMiddleware, async (req, resp) => {
    await CallbackRequest.deleteOne({id: req.params.id});
    resp.send('Deleted');
});

//mails
app.get('/emails', authMiddleware, async (req, resp) => {
    resp.send(await Email.find());
});
app.post('/emails', async (req, resp) => {
    let reqBody = req.body;
    let newEmail = new Email({
        id: uniqid(),
        name: reqBody.name,
        text: reqBody.text,
        email: reqBody.email,
        date: new Date()
    }) 
    await newEmail.save()
    resp.send('Accepted');
});
app.delete('/emails/:id', authMiddleware, async (req, resp) => {
    await Email.deleteOne({id: req.params.id});
    resp.send('Deleted');
});

app.get('/sight', async (req, resp) => {
    let id = req.query.id;
    let post = await Post.findOne({id: id});
    resp.render('sight', {
        title: post.title,
        imageURL: post.imageURL,
        date: post.date,
        text: post.text
    })
})

// users
app.post('/users/login', async (req, resp) => {
    let email = req.body.email;
    let password = req.body.password;
    let user = await User.find().where({email: email});
    if(user.length > 0) {
        let comparisonResult = await bcrypt.compare(password, user[0].password);
        if(comparisonResult) {
            let token = auth.generateToken(user[0]);
            resp.cookie('auth_token', token);
            resp.send({
                redirectURL: '/admin'
            }); 
        } else {
            resp.status(400);
            resp.send('Rejected');
        }
    } else {
        resp.send('Rejected');
    }
})

app.post('/users/register', async (req, resp) => {
    let email = req.body.email;
    let password = req.body.password;
    let user = await User.find().where({email: email});
    if(user.length === 0) {
        let encryptedPass = await bcrypt.hash(password, 12);
        let newUser = new User({
            email: email,
            password: encryptedPass
        })
        await newUser.save();
        resp.send('Done');
    } else {
        resp.send('Rejected');
    }
})

// admin login
app.get('/admin', (req, resp) => {
    let token = req.cookies['auth_token'];
    if(token && auth.checkToken(token)) {
        resp.render('admin');
    } else {
        resp.redirect('/login');
    }
    
})
app.get('/login', (req, resp) => {
    resp.render('login');
})








app.listen(3000, ()=> console.log('Listening 3000...'));