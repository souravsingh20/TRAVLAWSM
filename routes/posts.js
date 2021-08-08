
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

// app.get('/posts', async (req, resp)=>{
//     let posts = await Post.find();
//     resp.send(posts);
// })
// app.post('/posts', async (req, resp)=>{
//     let reqBody = req.body;
//     let imgPath;
//     if(reqBody.imageUrl){
//         imgPath = reqBody.imageURL;
//     } else{
//         imgPath = req.file.path.substring(req.file.path.indexOf(path.sep), req.file.path.length);
//     }

//     let newPost  = new Post({
//         id: uniqid(),
//         title: reqBody.title,
//         date: new Date(),
//         description: reqBody.description,
//         text: reqBody.text,
//         country: reqBody.country,
//         // imageURL: reqBody.imageUrl
//         imageURL: imgPath
//     })
//     // console.log(req.file);
//     await newPost.save();
//     resp.send('Created')
// })

// app.delete('/posts/:id', async (req, resp)=>{
//     let id = req.params.id;
//     await Post.deleteOne({id: id});
//     resp.send('Deleted!')
// })