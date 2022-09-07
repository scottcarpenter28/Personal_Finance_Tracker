const express = require("express");
const app = express();
app.use(express.static("public"));

let ejs = require('ejs');
app.set("view engine", 'ejs');

const mongoose = require('mongoose');
main().catch(err => console.log(err))
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/personal_finance_tracker');
}

const accountSchema = new mongoose.Schema({
    name: String,
    current_balance: Number
});
const FinancialAccount = mongoose.model("financialaccount", accountSchema);


app.get("/", function(request, response){
    FinancialAccount.find({}, function(err, foundAccounts){
        if(err)
            console.log(err);
    response.render("home", {accounts:foundAccounts});
    });
});

app.post("/add_account", function(request, response){
    FinancialAccount.find({}, function(err, foundAccounts){
        if(err)
            console.log(err);
    response.render("add-new-account", {accounts:foundAccounts});
    });
});

app.listen(3000, function(){
    console.log("Server started on port 3000");
}); 