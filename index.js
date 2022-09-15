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

const account_schema = new mongoose.Schema({
    name: String,
    current_balance: Number,
    account_type: String
});
const FinancialAccount = mongoose.model("financialaccount", account_schema);

const expense_schema = new mongoose.Schema({
    account_id: String,
    total: Number,
    description: String,
    date: Date
});
const Expense = mongoose.model("expense", expense_schema);

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

app.post("/account_view", function(request, response){
    account_id = request.body.account_id

    FinancialAccount.findById(account_id, function(err, matching_account){
        if(err)
            console.log(err);
        account_query = find_all_accounts();
        expense_query = find_all_expenses(account_id);

        account_query.then(function(found_accounts){
            
            expense_query.then(function(found_expenses){
                
                // Format the dates into mm/dd/yyyy
                formatted_dates = []
                found_expenses.forEach(function(entry){
                    let month =String(entry.date.getMonth() + 1);
                    let day = String(entry.date.getDate());
                    let year = String(entry.date.getFullYear());
                    formatted_dates.push({date:String(month +"/"+ day +"/"+ year), description: entry.description, total: entry.total})
                });

                response.render("account", {
                    accounts: found_accounts,
                    matched_account:matching_account,
                    account_expenses: formatted_dates
                });
            });
        });
    });
});

app.post("/add_new_expense", function(request, response){
    let req_body = request.body;
    let expense_date = req_body.expense_date;
    let expense_details = req_body.expense_details;
    let expense_total = req_body.expense_total;
    let account_id = req_body.account_id;

    let new_expense = new Expense({
        account_id: account_id,
        total: expense_total,
        description: expense_details,
        date: expense_date
    });
    
    new_expense.save(function(err){
        if(err)
            response.json(json_error("An error occurred while submitting a new expense."));
        else
            FinancialAccount.updateOne(
                {_id:account_id},
                { "$inc": { "current_balance": expense_total } },
                function(err, result){
                    if(err)
                        response.json(json_error("An error occurred while updating the account balance"));
                    else if(result.length == 0)
                        response.json(json_error("Expense inserted, but no accounts were updated"));
                    else
                        response.json(json_ok(""));
                }
            );
    });
});

app.listen(3000, function(){
    console.log("Server started on port 3000");
}); 

async function find_all_accounts () {
    try{
        const query = FinancialAccount.find({});
        return await query;
    } catch(err){
        console.error(err);
        return []
    }
}

async function find_all_expenses(account_id){
    try{
        const query = Expense.find({"account_id": account_id});
        return await query;
    }catch(err){
        console.error(err);
        return []
    }
}

function json_ok(msg){
    if(msg == undefined)
        msg = ""
    return {Error: false, Message: msg};
}

function json_error(msg){
    if(msg == undefined)
        msg = ""
    return {Error: true, Message: msg};
}