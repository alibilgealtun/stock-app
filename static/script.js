$(document).ready(function () {
    initializeDatePicker();
    handlePageLoad();
    attachGlobalEventHandlers();
    handlePaginationButtons();
    handleDepoFilterToggle();
});

let currentPage = 1; // Track the current page
let currentQuery = ''; // Track the current search query
function initializeDatePicker() {
    $.datepicker.regional['tr'] = {
        closeText: 'Kapat',
        prevText: '&#x3C;geri',
        nextText: 'ileri&#x3E;',
        currentText: 'Bugün',
        monthNames: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
        monthNamesShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
        dayNames: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
        dayNamesShort: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
        dayNamesMin: ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'],
        weekHeader: 'Hf',
        dateFormat: 'dd.mm.yy',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.setDefaults($.datepicker.regional['tr']);
    $("#purchaseDate, #saleDate").datepicker({
        changeMonth: true,
        changeYear: true,
        beforeShow: function(input, inst) {
            setTimeout(function() {
                inst.dpDiv.css({
                    top: $(input).offset().top + $(input).outerHeight() + 10,
                    left: $(input).offset().left
                });
            }, 0);
        }
    });

}

function handleChangingPage(event){
    if (event.keyCode === 13) {
        changePage();
    }
}
function changePage() {
    const pageInput = document.getElementById('pageInput').value;
    const pageNumber = parseInt(pageInput, 10);

    if (pageNumber && pageNumber > 0) {
        currentPage = pageNumber; // Update the global currentPage variable
        updatePage(currentPage);
    } else {
        alert('Please enter a valid page number.');
    }
}

function updatePage(page) {
    const depoFilterActive = $('#depoToggle').is(':checked');
    const queryParam = currentQuery ? `&query=${encodeURIComponent(currentQuery)}` : '';
    window.history.pushState({}, '', `?page=${page}&only_depo=${depoFilterActive}${queryParam}`);
    loadPage(page);
}


function handlePaginationButtons() {
    $("#prevPageBtn").click(function () {
        if (currentPage > 1) {
            currentPage--;
            updatePage(currentPage);
        }
    });

    $("#nextPageBtn").click(function () {
        currentPage++;
        updatePage(currentPage);
    });
}




function displayPage(data, page) {
    const itemsPerPage = 10;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    if (!data || data.length === 0) {
        console.log('No data to display.');
        $("#stokTable tbody").empty();
        $("#stokTable tbody").append('<tr><td colspan="8">Başka stok bulunamadı.</td></tr>');
        return;
    }

    $("#stokTable tbody").empty();
    data.forEach(function (stok) {
        $("#stokTable tbody").append(generateTableRow(stok));
    });

    attachEventHandlers();
    $("#currentPage").text(page);
}
function generateTableRow(stok) {
    let renkFiyatListesiHtml = '';
    if (Array.isArray(stok.colors_data)) {
        stok.colors_data.forEach(function (color) {
            renkFiyatListesiHtml += `<span class="renkFiyatItem" data-color="${color.renk_adi}" data-original-price="${parseFloat(color.fiyat).toFixed(2)}">
                                         ${color.renk_adi}: <span class="fiyat">${parseFloat(color.fiyat).toFixed(2)}</span><br>
                                     </span>`;
        });
    }

    return `<tr>
        <td id="operations">
            <button class="edit-btn" data-stok-id="${stok.OLIMPIA_KOD}">Detay</button>
            <button class="add-purchase-btn" data-stok-id="${stok.OLIMPIA_KOD}">Alım Ekle</button>
            <button class="add-sale-btn" data-stok-id="${stok.OLIMPIA_KOD}">Satış Ekle</button>
        </td>
        <td>${stok.OLIMPIA_KOD}</td>
        <td>${stok.STOK_ADI || ''}</td>
        <td>${stok.MODEL || ''}</td>
        <td>${stok.OZELLIK || ''}</td>
        <td>${stok.ADET || ''}</td>
        <td>${renkFiyatListesiHtml}</td>
        <td>
            <input type="number" class="iskonto-input" min="0" step="1" onkeypress="checkEnter(event)" placeholder="İndirim oranını girin. (%)">
        </td>
    </tr>`;
}




function loadDefaultData(page = currentPage) {
    $.ajax({
        url: `/get_stocks_paginated?page=${page}`,
        type: 'GET',
        success: function (response) {

            if (Array.isArray(response)) {
                displayPage(response, page);  // Directly pass the array of stocks
            } else {
                console.error('Unexpected response structure:', response);
                displayPage([], page); // Fallback to an empty array to avoid undefined
            }
        },
        error: function (err) {
            console.error('Error loading default data:', err);
        }
    });
}
function searchAcrossData(query) {
    currentQuery = query.trim();

    if (currentQuery === '') {
        currentPage = 1;
        loadDefaultData(); // Load default data when search is cleared
        return;
    }

    $.ajax({
        url: `/search?query=${encodeURIComponent(currentQuery)}`,
        type: 'GET',
        success: function (response) {
            if (Array.isArray(response)) {
                displayPage(response, 1);
            } else {
                console.error('Unexpected search response structure:', response);
                displayPage([], 1);
            }
        },
        error: function (err) {
            console.error('Search error:', err);
        }
    });
}


function attachGlobalEventHandlers() {
    $("#searchInput").on('input', function () {
        searchAcrossData($(this).val());
    });

    $(document).on('click', '.close', function () {
        $(this).closest(".modal").hide();
    });

    window.onclick = function (event) {
        if ($(event.target).hasClass('modal')) {
            $(event.target).hide();
        }
    };
}

function attachEventHandlers() {
    $('.edit-btn').off('click').on('click', function () {
        const stokId = $(this).data('stok-id');
        editStock(stokId);
    });

    $('.add-purchase-btn').off('click').on('click', function () {
        const stokId = $(this).data('stok-id');
        $('#purchaseOlimpiaKod').val(stokId);
        const olimpiaKod = $('#purchaseOlimpiaKod').val();
        $('#purchaseForm').show();
        loadColors();
        loadColorsWithPrices(olimpiaKod);
    });

    $('.add-sale-btn').off('click').on('click', function () {
        const stokId = $(this).data('stok-id');
        $('#saleOlimpiaKod').val(stokId);
        const olimpiaKod = $('#saleOlimpiaKod').val();
        $('#saleForm').show();
        loadColorsSale();
        loadColorsWithPricesForSale(olimpiaKod);

    });
}
function syncPriceInputWithDropdown() {
    const selectedPrice = $('#priceDropdown').val();
    $('#purchaseFiyat').val(selectedPrice);
}
function loadColorsWithPrices(olimpia_kod) {
    $.ajax({
        url: `/get_colors/${olimpia_kod}`,
        type: 'GET',
        success: function (data) {
            const priceDropdown = $('#priceDropdown');
            priceDropdown.empty();

            // Check if data exists and has a length greater than 0
            if (data && data.length > 0) {
                data.forEach(function (colorData) {
                    const option = `<option value="${colorData.fiyat}">${colorData.renk_adi}: ${colorData.fiyat}</option>`;
                    priceDropdown.append(option);
                });
            } else {
                priceDropdown.append('<option>Renk fiyat bilgisi bulunamadı.</option>');
            }
        },
        error: function (err) {
            console.error('Error loading colors with prices:', err);
        }
    });
}

function loadColorsWithPricesForSale(olimpia_kod) {
    $.ajax({
        url: `/get_colors/${olimpia_kod}`,
        type: 'GET',
        success: function (data) {
            const saleDropdown = $('#priceDropdownForSale'); // Corrected variable name
            saleDropdown.empty(); // Use the same variable name here


            // Check if data exists and has a length greater than 0
            if (data && data.length > 0) {
                data.forEach(function (colorData) {
                    const option = `<option value="${colorData.fiyat}">${colorData.renk_adi}: ${colorData.fiyat}</option>`;
                    saleDropdown.append(option); // Append options to the sale dropdown
                });
            } else {
                saleDropdown.append('<option>Renk fiyat bilgisi bulunamadı.</option>');
            }
        },
        error: function (err) {
            console.error('Error loading colors with prices:', err);
        }
    });
}


function editStock(stokId) {
    $.ajax({
        url: `/get_stock/${stokId}`,
        type: 'GET',
        success: function (data) {
            displayEditForm(data, stokId);
        },
        error: function (err) {
            console.error('Error:', err);
        }
    });
}

function displayEditForm(data, stokId) {
    $('#editForm').show();
    const formContent = $('#editFormContent').empty();
    formContent.append(`<input type="hidden" id="stokId" name="stokId" value="${stokId}">`);

    Object.keys(data.stock).forEach(function (key) {
        if (key !== 'OLIMPIA_KOD') {
            formContent.append(generateInputField(key, data.stock[key]));
        }
    });

    displayDetails(data.purchases, 'purchaseList', 'purchaseDetails');
    displayDetails(data.sales, 'saleList', 'saleDetails');
}

function generateInputField(key, value) {
    return `<div class="form-field">
        <label for="${key}">${key}</label>
        <input type="text" id="${key}" name="${key}" value="${value || ''}">
    </div>`;
}

function displayDetails(details, listId, detailsId) {
    const list = $(`#${listId}`).empty();
    details.forEach(function (detail) {
        list.append(`<li>${generateDetailText(detail)}</li>`);
    });
    $(`#${detailsId}`).show();
}

function generateDetailText(detail) {
    return `Tarih: ${detail.ALIM_TARIHI || detail.SATIS_TARIHI}, Adet: ${detail.ADET}, Fiyat: ${detail.FIYAT}, Renk: ${detail.renk_adi}`;
}

function handlePageLoad() {
    const urlParams = new URLSearchParams(window.location.search);
    currentPage = parseInt(urlParams.get('page')) || 1;
    currentQuery = urlParams.get('query') || '';

    loadPage(currentPage);
}

function getPageFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('page')) || 1;
}

function loadPage(page) {
    const depoFilterActive = $('#depoToggle').is(':checked');
    const queryParam = currentQuery ? `&query=${encodeURIComponent(currentQuery)}` : '';

    $.ajax({
        url: `/get_stocks_paginated?page=${page}&only_depo=${depoFilterActive}${queryParam}`,
        type: 'GET',
        cache: false,
        success: function (data) {
            displayPage(data, page);
        },
        error: function (err) {
            console.error('Error loading page:', err);
        }
    });
}
function submitSaleForm() {
    // Get the form data
    const formData = {
        OLIMPIA_KOD: $('#saleOlimpiaKod').val(),
        SATIS_TARIHI: $('#saleDate').val(),
        ADET: parseInt($('#saleAdet').val(), 10),
        RENK: $('#RENKSALE').val(),
        FIYAT: parseFloat($('#saleFiyat').val())
    };

    // Validate the form data
    if (!formData.OLIMPIA_KOD || !formData.SATIS_TARIHI || isNaN(formData.ADET) || !formData.RENK || isNaN(formData.FIYAT)) {
        alert('Lütfen tüm alanları doğru şekilde doldurun.');
        return;
    }

    // Send the data to the server
    $.ajax({
        url: '/add_sale',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function(response) {
            alert(response.message);
            $('#saleForm').hide(); // Hide the form after submission
            window.location.reload(); // Reload the page to reflect changes
        },
        error: function(err) {
            console.error('Error submitting sale form:', err);
            alert(`Error submitting sale form: ${err.responseText || 'Unknown error occurred'}`);
        }
    });
}


function submitPurchaseForm() {
    // Get the form data
    const formData = {
        OLIMPIA_KOD: $('#purchaseOlimpiaKod').val(),
        ALIM_TARIHI: $('#purchaseDate').val(),
        ADET: parseInt($('#purchaseAdet').val(), 10),
        RENK: $('#RENK').val(),
        FIYAT: parseFloat($('#purchaseFiyat').val())
    };

    // Validate the form data
    if (!formData.OLIMPIA_KOD || !formData.ALIM_TARIHI || isNaN(formData.ADET) || !formData.RENK || isNaN(formData.FIYAT)) {
        alert('Lütfen tüm alanları doğru şekilde doldurun.');
        return;
    }

    // Send the data to the server
    $.ajax({
        url: '/add_purchase',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function(response) {
            alert(response.message);
            $('#purchaseForm').hide(); // Hide the form after submission
            window.location.reload(); // Reload the page to reflect changes
        },
        error: function(err) {
            console.error('Error submitting purchase form:', err);
            alert(`Error submitting purchase form: ${err.responseText || 'Unknown error occurred'}`);
        }
    });
}

function handleDepoFilterToggle(currentPage) {
    $('#depoToggle').change(function () {
        window.history.pushState({}, '', `?page=${currentPage}&only_depo=${$(this).prop('checked')}`);
        loadPage(currentPage);
    });
}

function handlePaginationButtons() {
    $("#prevPageBtn").click(function () {
        if (currentPage > 1) {
            currentPage--; // Decrement the current page
            updatePage(currentPage);
        }
    });

    $("#nextPageBtn").click(function () {
        currentPage++; // Increment the current page
        updatePage(currentPage);
    });
}

function updatePage(page) {
    const depoFilterActive = $('#depoToggle').is(':checked');
    window.history.pushState({}, '', `?page=${page}&only_depo=${depoFilterActive}`);
    loadPage(page);
}

function checkEnter(event) {
    if (event.keyCode === 13) {
        applyDiscount($(event.target).closest('tr'));
    }
}
function applyDiscount(row) {
    // Get the discount rate from the input field
    const discountInput = row.find('.iskonto-input').val();
    let discountRate = parseFloat(discountInput);

    // Check if the discount rate is valid or if the input is empty
    if (discountInput === '' || isNaN(discountRate) || discountRate < 0) {
        // If input is empty or invalid, return original prices
        row.find('.renkFiyatItem').each(function () {
            const fiyatSpan = $(this).find('.fiyat');
            const originalPrice = parseFloat($(this).data('originalPrice'));

            if (isNaN(originalPrice)) {
                alert("Geçersiz fiyat değeri. Lütfen veriyi kontrol edin.");
                return;
            }

            // Display original price
            fiyatSpan.text(originalPrice.toFixed(2));
        });
    } else {
        // Apply discount if the rate is valid
        row.find('.renkFiyatItem').each(function () {
            const fiyatSpan = $(this).find('.fiyat');
            const originalPrice = parseFloat($(this).data('originalPrice'));

            if (isNaN(originalPrice)) {
                alert("Geçersiz fiyat değeri. Lütfen veriyi kontrol edin.");
                return;
            }

            // Calculate discounted price
            const discountedPrice = Math.max(originalPrice - (originalPrice * (discountRate / 100)), 0.00001);

            // Update the price display
            fiyatSpan.text(discountedPrice.toFixed(2));
        });
    }
}

function calculateDiscount(event) {
    if (event.keyCode !== 13) {
        return;
    }
    // Get the row where the input was triggered
    const row = $(event.target).closest('.modal-content');

    // Get the discount rate from the input field
    const discountInput = row.find('#purchaseIskonto').val();
    let discountRate = parseFloat(discountInput);

    // Check if the discount rate is valid or if the input is empty
    if (discountInput === '' || isNaN(discountRate) || discountRate < 0) {
        // If input is empty or invalid, return original price
        const originalPrice = parseFloat(row.find('#priceDropdown').val() || row.find('#purchaseFiyat').val());
        if (isNaN(originalPrice)) {
            alert("Fiyat kısmına doğru değeri girdiğinizden emin olun..");
            return;
        }
        row.find('#purchaseFiyat').val(originalPrice.toFixed(2));
        row.find('#discountedPrice').text(originalPrice.toFixed(2));
    } else {
        // Get the original price from the purchaseFiyat or priceDropdown input field
        const originalPrice = parseFloat(row.find('#purchaseFiyat').val());
        if (isNaN(originalPrice)) {
            alert("Fiyat kısmına doğru değeri girdiğinizden emin olun..");
            return;
        }

        // Calculate discounted price
        const discountedPrice = Math.max(originalPrice - (originalPrice * (discountRate / 100)), 0.00001);

        // Update the price display
        row.find('#purchaseFiyat').val(discountedPrice.toFixed(2));
        row.find('#discountedPrice').text(discountedPrice.toFixed(2));
    }
}

function syncSalePriceInputWithDropdown() {
    const selectedPrice = $('#priceDropdownForSale').val();
    $('#saleFiyat').val(selectedPrice);
}

function calculateSaleDiscount(event) {
    if (event.keyCode !== 13) {
        return;
    }
    // Get the row where the input was triggered
    const row = $(event.target).closest('.modal-content');

    // Get the discount rate from the input field
    const discountInput = row.find('#saleIskonto').val();
    let discountRate = parseFloat(discountInput);

    // Check if the discount rate is valid or if the input is empty
    if (discountInput === '' || isNaN(discountRate) || discountRate < 0) {
        // If input is empty or invalid, return original price
        const originalPrice = parseFloat(row.find('#priceDropdownSale').val() || row.find('#saleFiyat').val());
        if (isNaN(originalPrice)) {
            alert("Fiyat kısmına doğru değeri girdiğinizden emin olun.");
            return;
        }
        row.find('#saleFiyat').val(originalPrice.toFixed(2));
        row.find('#saleDiscountedPrice').text(originalPrice.toFixed(2));
    } else {
        // Get the original price from the saleFiyat or priceDropdownSale input field
        const originalPrice = parseFloat(row.find('#saleFiyat').val());
        if (isNaN(originalPrice)) {
            alert("Fiyat kısmına doğru değeri girdiğinizden emin olun.");
            return;
        }

        // Calculate discounted price
        const discountedPrice = Math.max(originalPrice - (originalPrice * (discountRate / 100)), 0.00001);

        // Update the price display
        row.find('#saleFiyat').val(discountedPrice.toFixed(2));
        row.find('#saleDiscountedPrice').text(discountedPrice.toFixed(2));
    }
}


// The following functions are kept as is to match the HTML:
function openAddForm() {
    $('#addStockForm').show();
    $('#addStockContent').empty(); // Clear previous form content

    $('#addStockContent').append(`
        <div class="form-field">
            <label for="OLIMPIA_KOD">OLIMPIA KOD <span style="color:red;">*</span></label>
            <input type="text" id="OLIMPIA_KOD" name="OLIMPIA_KOD" required>
        </div>
        <div class="form-field">
            <label for="STOK_ADI">STOK ADI <span style="color:red;">*</span></label>
            <input type="text" id="STOK_ADI" name="STOK_ADI" required>
        </div>
        <div class="form-field">
            <label for="UY">ÜY</label>
            <input type="text" id="UY" name="UY">
        </div>
        <div class="form-field">
            <label for="KONUM">KONUM</label>
            <input type="text" id="KONUM" name="KONUM">
        </div>
        <div class="form-field">
            <label for="MODEL">MODEL</label>
            <input type="text" id="MODEL" name="MODEL">
        </div>
        <div class="form-field">
            <label for="OZELLIK">ÖZELLİK</label>
            <input type="text" id="OZELLIK" name="OZELLIK">
        </div>
        <div class="form-field">
            <label for="DELIK">DELİK</label>
            <input type="text" id="DELIK" name="DELIK">
        </div>
        <div class="form-field">
            <label for="MM">MM</label>
            <input type="text" id="MM" name="MM">
        </div>
        <div class="form-field">
            <label for="M2">EBAT</label>
            <input type="text" id="M2" name="M2">
        </div>
        <div class="form-field-renk">
            <label for="RENK">RENK</label>
            <select id="RENK" name="RENK"></select>
            <input type="text" id="newColor" placeholder="Yeni Renk Ekle">
            <button type="button" onclick="addNewColor()">Renk Ekle</button>
        </div>
        <div class="form-field">
            <label for="ISKONTO">ISKONTO</label>
            <input type="text" id="ISKONTO" name="ISKONTO">
        </div>
    `);

    $('#addStockContent').append(`<button type="button" class="save-btn" onclick="addStock()">KAYDET</button>`);

    loadColors();
}

function addStock() {
    if (!validateAddStockForm()) return;

    const formData = {
        OLIMPIA_KOD: $('#OLIMPIA_KOD').val(),
        STOK_ADI: $('#STOK_ADI').val(),
        UY: $('#UY').val(),
        KONUM: $('#KONUM').val(),
        MODEL: $('#MODEL').val(),
        OZELLIK: $('#OZELLIK').val(),
        DELIK: $('#DELIK').val(),
        ADET: $('#ADET').val(),
        EN: $('#EN').val(),
        BOY: $('#BOY').val(),
        M2: $('#M2').val(),
        MM: $('#MM').val()
    };

    $.ajax({
        url: '/add_stock',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function (response) {
            alert(response.message);
            window.location.reload();
        },
        error: function (err) {
            console.error('Error:', err);
            alert('Stok eklerken bir hata oldu. Doğru değerleri girdiğinize emin olun.');
        }
    });
}

function validateAddStockForm() {
    let isValid = true;

    $('.error-message').remove();

    $('#addStockContent input[required]').each(function () {
        if ($(this).val().trim() === '') {
            isValid = false;
            const fieldName = $(this).attr('id').replace('_', ' ').toUpperCase();
            $(this).after(`<span class="error-message" style="color: red;">${fieldName} girmeden kayıt yapamazsınız.</span>`);
        }
    });

    return isValid;
}
function loadColors() {
    $.ajax({
        url: '/get_colors',
        type: 'GET',
        success: function (colors) {
            const renkSelect = $('#RENK');
            renkSelect.empty();
            if (colors && colors.length > 0) {
                colors.forEach(function (color) {
                    renkSelect.append(`<option value="${color}">${color}</option>`);
                });
            } else {
                renkSelect.append('<option>Renk bulunamadı.</option>');
            }
        },
        error: function (err) {
            console.error('Error loading colors:', err);
        }
    });
}


function loadColorsSale() {
    $.ajax({
        url: '/get_colors',
        type: 'GET',
        success: function (colors) {
            const renkSelect = $('#RENKSALE');
            renkSelect.empty();
            colors.forEach(function (color) {
                renkSelect.append(`<option value="${color}">${color}</option>`);
            });
        },
        error: function (err) {
            console.error('Error loading colors:', err);
        }
    });
}
function addNewColor() {
    const newColor = $('#newColor').val().trim();

    if (!newColor) {
        alert('Lütfen eklemek istediğiniz rengi girin.');
        return;
    }

    // Send the new color to the server
    $.ajax({
        url: '/add_color',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ color: newColor }),
        success: function(response) {
            alert(response.message);
            $('#newColor').val(''); // Clear the input field
            loadColors(); // Reload the colors dropdown to include the new color
        },
        error: function(err) {
            console.error('Error adding new color:', err);
            alert('Renk eklerken bir hata oluştu.');
        }
    });
}
