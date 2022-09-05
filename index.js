const express = require("express");
const app = express();
app.use(express.static("public"));

let ejs = require('ejs');
app.set("view engine", 'ejs');



app.get("/", function(request, response){
    response.render("home", {})
});

app.post("/add_account", function(request, response){
    response.render("add-new-account")
});

app.listen(3000, function(){
    console.log("Server started on port 3000")
}); 