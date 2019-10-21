var express = require("express");

var router = express.Router();

var index = require("../public/app.js")

var db = require("../models");

router.get("/", function(req, res) {
    index.all(function(data) {
        var hbsObject = {
            article: data
        };
        console.log(hbsObject);
        res.render("index");
    }); 
});

router.get("/scrape", function(req, res) {
    
    axios.get("https://www.huffpost.com/news/").then(function(response) {
        
        var $ = cheerio.load(response.data);
        
        $(".zone__content .card__headlines").each(function(i, element) {
        
        var result = {};
        
        result.title = $(this)
            .children("h2")
            .text();
        result.link = $(this)
            .children("a")
            .attr("href");
        db.Article.create(result)
            .then(function(dbArticle) {
            console.log(dbArticle);
            })
            .catch(function(err) {
            console.log(err);
            });
        });
        
        res.send("Scrape Complete");
    });
});

router.get("/articles", function(req, res)  {
    db.Article.find({})
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
    });
});

router.get("/articles/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
      .populate("note")
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) { 
        res.json(err);
    });
});

router.post("/articles/:id", function(req, res) {
    
    db.Note.create(req.body)
      .then(function(dbNote) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {       
        res.json(dbArticle);
      })
      .catch(function(err) {        
        res.json(err);
    });
});




module.exports = router;