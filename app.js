let express = require('express');
let app = express();
let mongoose = require('mongoose');
let Post = require ('./models/posts').Post;
let multer = require('multer');
let path = require('path');
let uniqid = require('uniqid');
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

app.post('/posts', async (req, resp)=>{
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

app.delete('/posts/:id', async (req, resp)=>{
    let id = req.params.id;
    await Post.deleteOne({id: id});
    resp.send('Deleted!')
})

app.put('/posts/:id', async (req, resp) => {
    let id = req.params.id;
    await Post.updateOne({id: id}, req.body);
    resp.send('Updated!');
})



app.use(express.static('public'));
// app.use('/callback-requests', callbackRequestsRouter);

app.get('/callback-requests', async (req, resp) => {
    resp.send(await CallbackRequest.find());
});
app.post('/callback-requests', async (req, resp) => {
    let reqBody = req.body;
    let newRequest = new CallbackRequest({
        id: uniqid(),
        phoneNumber: reqBody.phoneNumber,
        date: new Date()
    }) 
    await newRequest.save()
    resp.send('Accepted');
});
app.delete('/callback-requests/:id', async (req, resp) => {
    await CallbackRequest.deleteOne({id: req.params.id});
    resp.send('Deleted');
});

//mails
app.get('/emails', async (req, resp) => {
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
app.delete('/emails/:id', async (req, resp) => {
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




app.listen(3000, ()=> console.log('Listening 3000...'));