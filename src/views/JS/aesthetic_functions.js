/// Displays div on homepage that allows users to send commands to instrments
function display_function_div(ID) {
  if (window.app.visibilities.functions_div["DIV_ON"]) {
    document.getElementById("error_div").style.display = "none";
    for (i = 0; i < function_div_list.length; ++i) {
      if (function_div_list[i] === ID) {
        Swap_Visibility(ID);
      } else {
        x = document.getElementById(function_div_list[i]);
        x.style.display = "none";
      }
    }
  }
}

/// Swaps visibility of selected element
function Swap_Visibility(ID) {
  var x = document.getElementById(ID);
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}

/// Checks to see if inputted number is valid
function is_Valid_Number(num, lower_bound, upper_bound, ERROR_ID) {
  if (!isNaN(num) && num.length > 0) {
    if (num < lower_bound || num > upper_bound) {
      if (document.getElementById(ERROR_ID).style.display === "none") {
        Swap_Visibility(ERROR_ID);
      }
      return false;
    } else {
      if (document.getElementById(ERROR_ID).style.display === "block") {
        Swap_Visibility(ERROR_ID);
      }
      return true;
    }
  } else {
    if (document.getElementById(ERROR_ID).style.display === "none") {
      Swap_Visibility(ERROR_ID);
    }
    return false;
  }
}
