let express = require('express');
let router = express.Router();
let multer = require('multer');
let upload = multer({ dest: './public/images' });
let mongo = require('mongodb');
let db = require('monk')('localhost/nodeblog');
const { check, validationResult } = require('express-validator');

/* Link to particular 1 post */
router.get('/show/:id', function(req, res, next) {

    let posts = db.get('posts');
    posts.findOne(req.params.id,function (err, post){
        // console.log(post);
        res.render('show',{
            'post':post
        });
    });
});

/* GET Form */
router.get('/add', function(req, res, next) {
    let categories = db.get('categories');
    categories.find({},{},function (err, categories){
        res.render('addpost',{
            'title':'Add Post',
             'categories':categories
        });
    });
});

/* Post form data */
router.post('/add',[
    check('title').isEmpty().not().withMessage("Title Cannot be empty"),
    check('body').isEmpty().not().withMessage("Body Should not be empty")
],upload.single('mainimage'), function(req, res, next) {

    //get form data
    let title = req.body.title;
    let body = req.body.body;
    let author = req.body.author;
    let category = req.body.category;
    let date = new Date();


    //checking to see if file uploaded
    let mainimage ='';

    if(req.file){
        mainimage = req.file.filename;
    }else{
         mainimage = 'noimage.jpg';
    }

    //form validation
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else{
        let posts = db.get("posts");
        posts.insert({
            "title":title,
            "body":body,
            "category":category,
            "date":date,
            "author":author,
            "mainimage":mainimage
        },function (err,post){
            if (err) {
                res.send(err);
            }else {
                req.flash('message','Post Added');
                res.location("/");
                res.redirect("/");
            }
        });
    }

});



/* adding comments  data */
router.post('/addcomment',[
        check('name').isEmpty().not().withMessage("Name field is required"),
        check('body').isEmpty().not().withMessage("Body field is required"),
        check('body').isEmpty().not().withMessage("Email field is required"),
        check('email').isEmail().withMessage('Incorrect email format')

    ],
    function(req, res, next) {

    //get form data
    let name = req.body.name;
    let body = req.body.body;
    let email = req.body.email;
    let commentdate = new Date();
    let postid = req.body.postid;

    //
    //     let comment = {
    //         name:name,
    //         body:body,
    //         email:email,
    //         commentdate:commentdate,
    //         postid:postid
    //     }
    //
    // console.log(comment);

    //comment form validation
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        let posts = db.get('posts');
        posts.findOne(postid,function (err , post) {
            res.render('show',{
                "errors":errors.array(),
                "post":post
            });
        });
    } else{
        let comment = {
            name:name,
            body:body,
            email:email,
            commentdate:commentdate,
        }

        let posts=db.get("posts");
        posts.update({
            "_id":postid
        },{
            $push:{
                "comments":comment
            }
        },function (err,post){
            if (err) {
                res.send(err);
            }else {
                req.flash('message','Comment Added');
                res.location("/posts/show/"+postid);
                res.redirect("/posts/show/"+postid);
            }
        });
    }

});

module.exports = router;
