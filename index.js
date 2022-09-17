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
    let account_id = request.body.account_id;

    // For when accounts are refreshed
    let selected_month = request.body.selected_month;
    let refresh_account_id = request.body.refresh_account_id;

    // If the account view is being refreshed to see a different month
    if(refresh_account_id !== undefined)
        account_id = refresh_account_id;
    
    console.clear()
    let search_month;
    if(selected_month !== undefined){
        const total_reg = /(\d{4})-(\d{2})/;
        let match_results = selected_month.match(total_reg);
        console.log(match_results)
        
        if(match_results == undefined)
            search_month = new Date();
        else{
            // Convert the selected month to a date string 2022-08 -> 08/01/2022
            let date_str = match_results[2] + "/01/" + match_results[1];
            
            search_month = new Date(date_str);
            console.log(date_str);
            console.log(search_month.getMonth());
            // search_month = new Date();
        }
    }
    else
        search_month = new Date();

    FinancialAccount.findById(account_id,
        function(err, matching_account){
            if(err)
                console.log(err);
            account_query = find_all_accounts();
            expense_query = find_all_expenses(account_id, search_month);

            account_query.then(function(found_accounts){
                
                expense_query.then(function(found_expenses){
                    // Format the dates into mm/dd/yyyy
                    formatted_dates = [];
                    found_expenses.forEach(function(entry){
                        let month =String(entry.date.getMonth() + 1);
                        let day = String(entry.date.getDate());
                        let year = String(entry.date.getFullYear());
                        formatted_dates.push({date:String(month +"/"+ day +"/"+ year), description: entry.description, total: entry.total})
                    });

                    let month = ("0" + (search_month.getMonth()+1)).slice(-2);
                    let selected_month = search_month.getFullYear() + "-" + month;
                    console.log(selected_month)
                    response.render("account", {
                        accounts: found_accounts,
                        matched_account:matching_account,
                        account_expenses: formatted_dates,
                        month_view: selected_month
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

async function find_all_expenses(account_id, search_date){

    // If no date was provided, the assume we are looking at the current month
    if(search_date == undefined)
        search_date = new Date();
    else
        search_date = new Date(search_date);
    // console.log("from " + new Date(search_date.getFullYear(), search_date.getMonth(), 1));
    // console.log("to " + new Date(search_date.getFullYear(), search_date.getMonth(), 30))

    try{
        const query = Expense.find({
            "account_id": account_id,
            date:{ 
                $gte: new Date(search_date.getFullYear(), search_date.getMonth(), 1),
                $lte:  new Date(search_date.getFullYear(), search_date.getMonth(), 31)
            }
        });
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