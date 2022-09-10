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

function show_message_modal(title, error_message){
    $("#msg-title").text(title);
    $("#message-body").text(error_message);
    $("#message-modal").modal("show");
}