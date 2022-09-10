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
    let form_body = request.body;
    let account_name = form_body.name;
    let account_type = form_body.account_type;
    let starting_balance = form_body.balance;

    let new_account = new FinancialAccount({
        name: account_name, 
        current_balance: starting_balance,
        account_type: account_type
    });

    new_account.save(function(err){
        if(err)
            response.json(json_error("Error occurred while adding the account"));
        else
            response.json(json_ok(""));
    });
});

app.listen(3000, function(){
    console.log("Server started on port 3000");
}); 

function json_ok(msg){
    if(msg == undefined)
        msg = ""
    return {Error: false, msg};
}

function json_error(msg){
    if(msg == undefined)
        msg = ""
    return {Error: True, msg};
}