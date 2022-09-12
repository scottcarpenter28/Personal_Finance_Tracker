function click_add_new_account(){
    let account_name = $("#account_name").val();
    if(account_name.length == 0)
        return show_message_modal("Error", "No account name was provided");
    
    let account_type = $('input[name="account_type"]:checked').val();
    if(account_type == "Other")
        account_type = $("#other_account").val()
    
    if(account_name == undefined)
        return show_message_modal("Error", "No account type was selected");

    let starting_balance = parseFloat($("#starting_balance").val());
    if(Number.isNaN(starting_balance))
        return show_message_modal("Error", "Invalid number for account starting balance");

    let form_data = {
        name: account_name,
        account_type: account_type,
        balance: starting_balance
    };

    $.post(
        "/add_account", 
        form_data,
        function(data, status){
            if(data.Error)
                return show_message_modal("Error", data.Message);
            // Have this change to the new account page once created 
            location.reload();
        }
    );
}

function click_add_new_expense(account_id){
    let expense_date = $("#new-expense-date").val();
    expense_date = Date(expense_date);
    if(!expense_date instanceof Date)
        return show_message_modal("Error", "Date of expense could not be converted to a date.");

    let expense_details = $("#new-expense-details").val();

    const total_reg = /^\d*(\.\d{0,2})?$/;
    let expense_total_before = $("#expense-total").val().match(total_reg);
    console.log(expense_total_before)

    if(expense_total_before == undefined)
        return show_message_modal("Error", "Expense total was not a valid number.");
    if(expense_total_before[0] === "")
        return show_message_modal("Error", "Expense total was not a valid number.");

    let expense_total = expense_total_before[0]
    if(Number.isNaN(expense_total))
        return show_message_modal("Error", "Expense total was not a valid number.");

    form_data = {
        "expense_date": expense_date,
        "expense_details": expense_details,
        "expense_total": expense_total,
        "account_id": account_id
    }
    $.post(
        "/add_new_expense",
        form_data,
        function(data, status){
            if(data.Error)
                return show_message_modal("Error", data.Message);
            console.log(data.Message)
        }
    )
}

function show_message_modal(title, error_message){
    $("#msg-title").text(title);
    $("#message-body").text(error_message);
    $("#message-modal").modal("show");
}