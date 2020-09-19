let express = require('express');
let router = express.Router();
let mongo = require('mongodb');
let db = require('monk')('localhost/nodeblog');
const { check, validationResult } = require('express-validator');


/* GET Form */
router.get('/add', function(req, res, next) {
    res.render('addcategory',{
        'title': 'Add Category'
    });
});


/* Show Categories */
router.get('/show/:category', function(req, res, next) {
    let posts = db.get('posts');

    posts.find({category:req.params.category},{},function (err, posts) {
        res.render('index',{
           'title': req.params.category,
           'posts': posts
        });
    });
});


router.post('/add',[
    check('name').notEmpty().withMessage('Name is required')
],function (req,res) {

    //getting the category name from input
    let name = req.body.name;

    let errors = validationResult(req);

    if (!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
        let categories = db.get('categories');
        categories.insert({
            'name':name
        },function (err, post) {
           if (err){
               console.log(err);
           }else{
               req.flash('message','Category Added');
               res.location('/');
               res.redirect('/');
           }
        });
})



module.exports = router;
