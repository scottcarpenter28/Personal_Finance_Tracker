const express = require("express");
const app = express();
app.use(express.static("public"));

let ejs = require('ejs');
app.set("view engine", 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({extended: true })
);


const mongoose = require('mongoose');
main().catch(err => console.log(err))
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/personal_finance_tracker');
}

const accountSchema = new mongoose.Schema({
    name: String,
    current_balance: Number,
    account_type: String
});
const FinancialAccount = mongoose.model("financialaccount", accountSchema);


app.get("/", function(request, response){
    FinancialAccount.find({}, function(err, foundAccounts){
        if(err)
            console.log(err);
    response.render("home", {accounts:foundAccounts});
    });
});

app.get("/add_account", function(request, response){
    FinancialAccount.find({}, function(err, foundAccounts){
        if(err)
            console.log(err);
    response.render("add-new-account", {accounts:foundAccounts});
    });
});

app.post("/add_account", function(request, response){
// Add a new account to the db
    let account_name = request.body.account_name;
    // Todo: Add a check for empty/missing account name

    let account_type = request.body.account_type;
    // Todo: Add a check to make sure that an account type was selected

    let other_account = request.body.other_account;
    // For a custom account type
    if(account_type == "Other")
        account_type = other_account;
    // Todo: Add a check for empty strings

    let starting_balance = request.body.starting_balance;
    starting_balance = parseFloat(starting_balance);
    // Todo: Add a check for bad/undefined numbers

    let new_account = new FinancialAccount({
        name: account_name, 
        current_balance: starting_balance,
        account_type: account_type
    });

    new_account.save(function(err){
        if(err)
            console.log(err);
        response.redirect("/add_account")
    });
});

app.listen(3000, function(){
    console.log("Server started on port 3000");
}); 