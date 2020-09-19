let express = require('express');
let router = express.Router();
let multer = require('multer');
let upload = multer({ dest: './public/images' });
let mongo = require('mongodb');
let db = require('monk')('localhost/nodeblog');
const { check, validationResult } = require('express-validator');


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

module.exports = router;
