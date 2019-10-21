var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

app.get("/scrape", function(req, res) {
    
    axios.get("https://www.huffpost.com/news/").then(function(response) {
        
        var $ = cheerio.load(response.data);

        
        $("zone__content card__headlines").each(function(i, element) {
        
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

app.get("/articles", function(req, res)  {
    db.Article.find({})
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
    });
});













var routes = require("./controllers/articlesController");

app.use(routes);

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
