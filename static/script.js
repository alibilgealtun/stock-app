$(document).ready(function() {
    function searchTable() {
        let input = $("#searchInput").val().toUpperCase();
        let table = $("#stokTable");
        let tr = table.find("tr");

        for (let i = 1; i < tr.length; i++) {
            $(tr[i]).hide();
            let td = $(tr[i]).find("td");
            for (let j = 0; j < td.length; j++) {
                if (td[j] && $(td[j]).text().toUpperCase().indexOf(input) > -1) {
                    $(tr[i]).show();
                    break;
                }
            }
        }
    }
    $("#searchInput").on("keyup", searchTable);



    function setCaretPosition(elem, caretPos) {
        if (elem != null) {
            if (elem.createTextRange) {
                var range = elem.createTextRange();
                range.move('character', caretPos);
                range.select();
            } else {
                if (elem.selectionStart) {
                    elem.focus();
                    elem.setSelectionRange(caretPos, caretPos);
                } else {
                    elem.focus();
                }
            }
        }
    }

function makeEditable(cell, event) {
    // Store the current text content of the cell
    let currentValue = cell.innerText.trim();
    let stokId = cell.getAttribute('data-stok-id');
    let field = cell.getAttribute('data-field');

    // Create a new input element for editing
    let inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = currentValue;

    // Replace the cell's content with the input field
    cell.innerHTML = '';
    cell.appendChild(inputField);

    // Focus on the input field
    inputField.focus();

    // Handle blur event to save changes
    inputField.addEventListener('blur', () => {
        let newValue = inputField.value.trim();
        if (newValue !== currentValue) {
            // Update cell content with new value
            cell.textContent = newValue;

            // Update database through AJAX call
            updateStockField(stokId, field, newValue);
        } else {
            // Restore original content if not changed
            cell.textContent = currentValue;
        }
    });

    // Handle keydown event for Enter and Escape keys
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            inputField.blur(); // Trigger blur event to save changes on Enter
        } else if (e.key === 'Escape') {
            // Restore original content on Escape
            cell.textContent = currentValue;
            inputField.blur(); // Trigger blur event to cancel editing on Escape
        }
    });
}

    function updateStockField(stokId, field, newValue) {
        $.ajax({
            url: '/update',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                stok_id: stokId,
                field_name: field,
                new_value: newValue
            }),
            success: function(response) {
                if (response.success) {
                    console.log('Update successful');
                } else {
                    console.error('Update failed');
                }
            },
            error: function(error) {
                console.error('Error:', error);
            }
        });
    }


    $(".editable").on('click', function(event) {
        makeEditable(event.currentTarget, event);
    });
});
