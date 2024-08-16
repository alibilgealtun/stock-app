$(document).ready(function() {
    $.datepicker.regional['tr'] = {
        closeText: 'Kapat',
        prevText: '&#x3C;geri',
        nextText: 'ileri&#x3E;',
        currentText: 'Bugün',
        monthNames: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
            'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
        monthNamesShort: ['Oca','Şub','Mar','Nis','May','Haz',
            'Tem','Ağu','Eyl','Eki','Kas','Ara'],
        dayNames: ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],
        dayNamesShort: ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'],
        dayNamesMin: ['Pz','Pt','Sa','Ça','Pe','Cu','Ct'],
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
    });


    // Close modal when clicking outside of it
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = "none";
        }
    };


    // Modal close functionality
    document.querySelectorAll(".close").forEach(button => {
        button.addEventListener("click", function() {
            var modal = this.closest(".modal");
            modal.style.display = "none";
        });
    });


});

$(document).ready(function() {
    $("#searchInput").on('input', function() {
        var query = $(this).val();
        if (query.length >= 3) {  // Optional: only search if the query is long enough
            searchAcrossData(query);
        }
    });

    function searchAcrossData(query) {
        $.ajax({
            url: `/search?query=${query}&page=1&page_size=10`,
            type: 'GET',
            success: function(data) {
                // Clear and populate the table with the search results
                $("#stokTable tbody").empty();
                data.forEach(function(stok) {
                    var renkFiyatListesiHtml = '';
                    stok.colors_data.forEach(function(color) {
                        renkFiyatListesiHtml += `<span class="renk">${color.renk_adi}</span>: <span class="fiyat">${parseFloat(color.fiyat).toFixed(2)}</span>`;
                    });

                    var rowHtml = `<tr>
                        <td id="operations">
                            <button class="edit-btn" data-stok-id="{{ stok.OLIMPIA_KOD }}">Detay</button>
                            <button class="add-purchase-btn" data-stok-id="{{ stok.OLIMPIA_KOD }}">Alım Ekle</button>
                            <button class="add-sale-btn" data-stok-id="{{ stok.OLIMPIA_KOD }}">Satış Ekle</button>
                        </td>
                        <td>${stok.OLIMPIA_KOD}</td>
                        <td>${stok.STOK_ADI || ''}</td>
                        <td>${stok.MODEL || ''}</td>
                        <td>${stok.OZELLIK || ''}</td>
                        <td>${stok.ADET || ''}</td>
                        <td class="renkFiyatItem" ">${renkFiyatListesiHtml}</td>
                                    <td>
                        <input type="number" class="iskonto-input" min="0" step="1" onkeypress="checkEnter(event)" placeholder="İndirim oranını girin. (%)">
                    </td>

                    </tr>`;
                    $("#stokTable tbody").append(rowHtml);
                });
            },
            error: function(err) {
                console.error('Search error:', err);
            }
        });
    }
});

$(document).ready(function() {
    var currentPage = getPageFromUrl();
    var depoFilterActive = false;

    function loadPage(page) {
        $.ajax({
            url: `/get_stocks_paginated?page=${page}&only_depo=${depoFilterActive}`,
            type: 'GET',
            cache: false,
            success: function(data) {
                // Clear the existing table rows
                $("#stokTable tbody").empty();

                // Append the new rows
                data.forEach(function(stok) {
                    var renkFiyatListesiHtml = '';
                    stok.colors_data.forEach(function(color) {
                        renkFiyatListesiHtml += `<span class="renk">${color.renk_adi}</span>: <span class="fiyat">${parseFloat(color.fiyat).toFixed(2)}</span>`;
                    });

                    var rowHtml = `
                    <tr>
                        <td id="operations">
                            <button class="edit-btn" data-stok-id="${stok.OLIMPIA_KOD}">Detay</button>
                            <button class="add-purchase-btn" data-stok-id="${stok.OLIMPIA_KOD}">Alım Ekle</button>
                            <button class="add-sale-btn" data-stok-id="${stok.OLIMPIA_KOD}">Satış Ekle</button>
                        </td>
                        <td>${stok.OLIMPIA_KOD}</td>
                        <td>${stok.STOK_ADI}</td>
                        <td>${stok.MODEL || ''}</td>
                        <td>${stok.OZELLIK || ''}</td>
                        <td>${stok.ADET || ''}</td>
                        <td class="renkFiyatItem" ">${renkFiyatListesiHtml}</td>
                        <td>
                            <input type="number" class="iskonto-input" min="0" step="1" onkeypress="checkEnter(event)" placeholder="İndirim oranını girin. (%)">
                        </td>
                    </tr>`;

                    $("#stokTable tbody").append(rowHtml);
                });

                // Update current page display
                $("#currentPage").text(page);

                // Reattach event handlers (because new DOM elements were added)
                attachEventHandlers();
            },
            error: function(err) {
                console.error('Error loading page:', err);
            }
        });
    }
    // Ensure that if the URL changes, the page content is updated
    $(window).on('popstate', function() {
        loadPage(getPageFromUrl());
    });
    function getPageFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return parseInt(urlParams.get('page')) || 1;
    }
    function attachEventHandlers() {
        $('.edit-btn').click(function() {
            var stokId = $(this).attr('data-stok-id');
            $.ajax({
                url: '/get_stock/' + stokId,
                type: 'GET',
                success: function(data) {
                    $('#editForm').css('display', 'block');
                    var formContent = $('#editFormContent');
                    formContent.empty();
                    formContent.append('<input type="hidden" id="stokId" name="stokId" value="' + stokId + '">');
                    Object.keys(data.stock).forEach(function(key) {
                        if (key !== 'OLIMPIA_KOD') {
                            var value = data.stock[key] !== null ? data.stock[key] : '';
                            var inputField = '<div class="form-field">' +
                                '<label for="' + key + '">' + key + '</label>' +
                                '<input type="text" id="' + key + '" name="' + key + '" value="' + value + '">' +
                                '</div>';
                            formContent.append(inputField);
                        }
                    });
                    // Display purchase details
                    const purchaseList = document.getElementById('purchaseList');
                    purchaseList.innerHTML = ''; // Clear previous list
                    data.purchases.forEach(function(purchase) {
                        const listItem = document.createElement('li');
                        listItem.textContent = `Tarih: ${purchase.ALIM_TARIHI}, Adet: ${purchase.ADET}, Fiyat: ${purchase.FIYAT}, Renk: ${purchase.renk_adi}`;
                        purchaseList.appendChild(listItem);
                    });

                    // Display sale details
                    const saleList = document.getElementById('saleList');
                    saleList.innerHTML = ''; // Clear previous list
                    data.sales.forEach(function(sale) {
                        const listItem = document.createElement('li');
                        listItem.textContent = `Tarih: ${sale.SATIS_TARIHI}, Adet: ${sale.ADET}, Fiyat: ${sale.FIYAT}, Renk: ${sale.renk_adi}`;
                        saleList.appendChild(listItem);
                    });

                    document.getElementById('purchaseDetails').style.display = 'block';
                    document.getElementById('saleDetails').style.display = 'block';
                },
                error: function(err) {
                    console.error('Hata:', err);
                }
            });
        });

        $('.add-purchase-btn').click(function() {
            $('#purchaseForm input').val(''); // Clears the value of all input fields
            $('#purchaseOlimpiaKod').val(stokId);
            $('#purchaseForm').css('display', 'block');
            loadColors();
        });
        $('.add-sale-btn').click(function() {
            $('#saleForm input').val(''); // Clears the value of all input fields
            var stokId = $(this).attr('data-stok-id');
            $('#saleOlimpiaKod').val(stokId);
            $('#saleForm').css('display', 'block');
            loadColorsSale();
        });

    }
    $("#depoToggle").change(function() {
        depoFilterActive = $(this).prop('checked');
        window.history.pushState({}, '', `?page=${currentPage}&only_depo=${depoFilterActive}`);
        loadPage(currentPage);
    });
    // Pagination buttons
    $("#prevPageBtn").click(function() {
        if (currentPage > 1) {
            currentPage--;
            window.history.pushState({}, '', `?page=${currentPage}&only_depo=${depoFilterActive}`);
            loadPage(currentPage);
        }
    });
    $("#nextPageBtn").click(function() {
        currentPage++;
        window.history.pushState({}, '', `?page=${currentPage}&only_depo=${depoFilterActive}`);
        loadPage(currentPage);
    });


    loadPage(getPageFromUrl());
});

$(document).ready(function() {
    var depoFilterActive = false;

    $('#depoToggle').change(function() {
        depoFilterActive = $(this).prop('checked'); // Toggle switch state

        // Tablodaki tüm satırları seç
        $('#stokTable tbody tr').each(function(index) {
            if (index !== 0) { // Başlık satırını hariç tut
                var adetCell = $(this).find('td:nth-child(6)'); // Adet sütunu (6. sütun) bul

                // Adet değerini kontrol et
                var adetValue = adetCell.text().trim();
                var adetValid = adetValue !== '' && parseInt(adetValue) >= 1;

                if (depoFilterActive) {
                    if (adetValid) {
                        $(this).show(); // Adeti 1 ve daha fazla olan satırları göster
                    } else {
                        $(this).hide(); // Adeti olmayan veya 0 olan satırları gizle
                    }
                } else {
                    $(this).show(); // Filtre kapalıysa tüm satırları göster
                }
            }
        });
    });

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

    $('.edit-btn').click(function() {
        var stokId = $(this).attr('data-stok-id');
        $.ajax({
            url: '/get_stock/' + stokId,
            type: 'GET',
            success: function(data) {
                $('#editForm').css('display', 'block');
                var formContent = $('#editFormContent');
                formContent.empty();
                formContent.append('<input type="hidden" id="stokId" name="stokId" value="' + stokId + '">');
                Object.keys(data).forEach(function(key) {
                    if (key !== 'OLIMPIA_KOD') {
                        var value = data[key] !== null ? data[key] : '';
                        var inputField = '<div class="form-field">' +
                            '<label for="' + key + '">' + key + '</label>' +
                            '<input type="text" id="' + key + '" name="' + key + '" value="' + value + '">' +
                            '</div>';
                        formContent.append(inputField);
                    }
                });
            },
            error: function(err) {
                console.error('Hata:', err);
            }
        });
    });

    $('.add-purchase-btn').click(function() {
        var stokId = $(this).attr('data-stok-id');
        $('#purchaseOlimpiaKod').val(stokId);
        $('#purchaseForm').css('display', 'block');
        loadColors();
    });

    $('.close').click(function() {
        $('#editForm').css('display', 'none');
        $('#addStockForm').css('display', 'none');
        $('#purchaseForm').css('display', 'none');
    });

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const stokId = this.getAttribute('data-stok-id');
            fetch(`/get_purchases/${stokId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.log(data.error);
                    } else {
                        const purchaseList = document.getElementById('purchaseList');
                        purchaseList.innerHTML = ''; // Clear previous list
                        data.forEach(purchase => {
                            const listItem = document.createElement('li');
                            listItem.textContent = `Tarih: ${purchase.ALIM_TARIHI}, Adet: ${purchase.ADET}, Fiyat: ${purchase.FIYAT}, Renk: ${purchase.renk_adi}`;
                            purchaseList.appendChild(listItem);
                        });
                        document.getElementById('purchaseDetails').style.display = 'block';
                    }
                });
        });
    });
});

// Formu gönderme işlemi
function submitForm() {
    var formData = $('#editFormContent').serializeArray();
    var stokId = $('#stokId').val(); // Hidden input alanından stokId'yi al
    var currentPage = parseInt($("#currentPage").text()); // Get the current page

    $.ajax({
        url: '/update_stock/' + stokId,
        type: 'PUT',
        data: formData,
        cache: false,  // Disable caching
        contentType: 'application/x-www-form-urlencoded',
        success: function(response) {
            alert(response.message);
            $('#editForm').css('display', 'none');
            // Reload the page to reflect updated data, staying on the current page
            window.location.href = `?page=${currentPage}`;
        },
        error: function(err) {
            console.error('Error:', err);
        }
    });
}


function openAddForm() {
    $('#addStockForm').css('display', 'block');
    $('#addStockContent').empty(); // Clear previous form content

    // Append the form fields
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
            <select id="RENK" name="RENK">
                <!-- Mevcut renkler buraya yüklenecek -->
            </select>
            <input type="text" id="newColor" placeholder="Yeni Renk Ekle">
            <button type="button" onclick="addNewColor()">Renk Ekle</button>
        </div>
        <div class="form-field">
            <label for="ISKONTO">ISKONTO</label>
            <input type="text" id="ISKONTO" name="ISKONTO">
        </div>
    `);

    // Append the save button
    $('#addStockContent').append(`<button type="button" class="save-btn" onclick="addStock()">KAYDET</button>`);

    loadColors(); // Load the colors into the RENK dropdown
}

function loadColors() {
    $.ajax({
        url: '/get_colors', // Renkleri getiren API endpoint
        type: 'GET',
        success: function(data) {
            var renkSelect = $('#RENK');
            renkSelect.empty(); // Mevcut seçenekleri temizle
            data.forEach(function(renk) {
                renkSelect.append(new Option(renk, renk));

            });
        },
        error: function(err) {
            console.error('Hata:', err);
        }
    });
}

function loadColorsSale() {
    $.ajax({
        url: '/get_colors', // Renkleri getiren API endpoint
        type: 'GET',
        success: function(data) {
            var renkSelect = $('#RENKSALE');
            renkSelect.empty(); // Mevcut seçenekleri temizle
            data.forEach(function(renk) {
                renkSelect.append(new Option(renk, renk));
            });
        },
        error: function(err) {
            console.error('Hata:', err);
        }
    });
}

function addNewColor() {
    var newColor = $('#newColor').val();
    if (newColor) {
        $.ajax({
            url: '/add_color',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ color: newColor }),
            success: function(response) {
                var renkSelect = $('#RENK');
                renkSelect.append(new Option(newColor, newColor));
                $('#newColor').val(''); // Input alanını temizle
                alert(response.message);
            },
            error: function(err) {
                console.error('Hata:', err);
                alert('Renk eklenirken bir hata oluştu.');
            }
        });
    }
}

function addNewColorSale() {
    var newColor = $('#newColorSale').val();
    if (newColor) {
        $.ajax({
            url: '/add_color',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ color: newColor }),
            success: function(response) {
                var renkSelect = $('#RENKSALE');
                renkSelect.append(new Option(newColor, newColor));
                $('#newColor').val(''); // Input alanını temizle
                alert(response.message);
            },
            error: function(err) {
                console.error('Hata:', err);
                alert('Renk eklenirken bir hata oluştu.');
            }
        });
    }
}

function addStock() {
    // Validate the form first
    if (!validateAddStockForm()) {
        return;  // If validation fails, don't proceed with the submission
    }

    var formData = {
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
        success: function(response) {
            alert(response.message);
            // Refresh the page after a successful addition
            window.location.reload();
        },
        error: function(err) {
            console.error('Error:', err);
            alert('An error occurred while adding the stock.');
        }
    });
}

function validateAddStockForm() {
    let isValid = true;

    // Clear previous error messages
    $('.error-message').remove();

    // Check required fields
    $('#addStockContent input[required]').each(function() {
        if ($(this).val().trim() === '') {
            isValid = false;
            const fieldName = $(this).attr('id').replace('_', ' ').toUpperCase();
            $(this).after(`<span class="error-message" style="color: red;">${fieldName} girmeden kayıt yapamazsınız.</span>`);
        }
    });

    return isValid;
}

function submitPurchaseForm() {
    if (!validateDate('purchaseDate')) return;

    var formData = $('#purchaseFormContent').serialize();
    $.ajax({
        url: '/add_purchase',
        type: 'POST',
        data: formData,
        contentType: 'application/x-www-form-urlencoded',
        success: function(response) {
            alert(response.message);
            $('#purchaseForm').css('display', 'none');
            location.reload();
        },
        error: function(err) {
            console.error('Error:', err);
            alert("Lütfen tarihi doğru girdiğinizden emin olun.")
        }
    });
}

function submitSaleForm() {
    if (!validateDate('saleDate')) return;

    var formData = $('#saleFormContent').serialize();
    $.ajax({
        url: '/add_sale',
        type: 'POST',
        data: formData,
        contentType: 'application/x-www-form-urlencoded',
        success: function(response) {
            alert(response.message);
            $('#saleForm').css('display', 'none');
            location.reload();
        },
        error: function(err) {
            console.error('Error:', err);
            alert("Lütfen tarihi doğru girdiğinizden emin olun.")
        }
    });
}

// Ensure that the sale form modal opens correctly
function openSaleModal(olimpiaKod) {
    var modal = document.getElementById("saleForm");
    var span = modal.querySelector(".close");
    var purchaseOlimpiaKod = modal.querySelector("#saleOlimpiaKod");

    // Set the OLIMPIA_KOD in the hidden input field
    if (purchaseOlimpiaKod) {
        purchaseOlimpiaKod.value = olimpiaKod;
    }

    // Display the modal
    modal.style.display = "block";

    // Close the modal when the X is clicked
    span.onclick = function () {
        modal.style.display = "none";
    }

    // Close the modal when clicking outside of it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

// Attach event listeners to the Satış Ekle buttons
document.querySelectorAll(".add-sale-btn").forEach(button => {
    button.addEventListener("click", function(event) {
        var olimpiaKod = event.currentTarget.getAttribute("data-stok-id");
        openSaleModal(olimpiaKod); // Open the sale modal
    });
});

// Modal close functionality
document.querySelectorAll(".close").forEach(button => {
    button.addEventListener("click", function() {
        var modal = this.closest(".modal");
        modal.style.display = "none";
    });
});

// Close modal when clicking outside of it
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

// İskonto uygulama fonksiyonu

function applyDiscount(row) {
    var iskontoInput = row.querySelector('.iskonto-input');
    var iskontoMiktari = parseFloat(iskontoInput.value);

    if (isNaN(iskontoMiktari) || iskontoMiktari < 0) {
        alert("Doğru iskonto miktarı girdiğinize emin olun.");
        return;
    }

    var renkFiyatListesi = row.querySelectorAll('.renkFiyatItem');
    renkFiyatListesi.forEach(function(item) {
        var fiyatSpan = item.querySelector('.fiyat');

        if (fiyatSpan) {
            // If this is the first time applying a discount, store the original price
            if (!item.dataset.originalPrice) {
                item.dataset.originalPrice = fiyatSpan.textContent;
            }

            var orijinalFiyat = parseFloat(item.dataset.originalPrice);

            if (isNaN(orijinalFiyat)) {
                alert("Geçersiz fiyat değeri. Lütfen veriyi kontrol edin.");
                return;
            }

            var indirimliFiyat = orijinalFiyat - (orijinalFiyat * (iskontoMiktari / 100));
            indirimliFiyat = Math.max(indirimliFiyat, 0.00001); // Prevents negative or zero prices

            fiyatSpan.textContent = indirimliFiyat.toFixed(2);
        }
    });
}

// Enter tuşuna basıldığında kontrol fonksiyonu
function checkEnter(event) {
    if (event.keyCode === 13) { // Enter tuşuna basıldığında
        var row = event.target.closest('tr'); // Event'in gerçekleştiği satırı bulalım
        if (row) {
            applyDiscount(row); // Iskonto miktarını sadece ilgili satırdaki fiyatlara uygula
        }
    }
}

function calculateDiscount(event) {
    // FOR ALIŞ EKLE PART
    if (event.keyCode === 13) { // Check if Enter key is pressed
        var originalPriceInput = document.getElementById('purchaseFiyat');
        var discountRateInput = event.target; // Get the specific input that triggered the event
        var discountedPriceSpan = document.getElementById('discountedPrice');

        var originalPrice = parseFloat(originalPriceInput.value);
        var discountRate = parseFloat(discountRateInput.value);

        if (isNaN(discountRate) || discountRate < 0) {
            alert("Doğru iskonto miktarı girdiğinize emin olun.");
            discountedPriceSpan.textContent = ''; // Clear the discounted price
            return;
        }

        if (!isNaN(originalPrice)) {
            var discountedPrice = originalPrice - (originalPrice * (discountRate / 100));
            // Ensure the discounted price does not go below a small positive threshold
            discountedPrice = discountedPrice <= 0 ? 0.00001 : discountedPrice;
            discountedPriceSpan.textContent = 'İskontolu Fiyat: ' + discountedPrice.toFixed(2) + ' TL';
        } else {
            discountedPriceSpan.textContent = '';
        }
    }
}

function calculateSaleDiscount(event) {
    if (event.keyCode === 13) { // Check if Enter key is pressed
        var saleFormContent = event.target.closest('#saleFormContent'); // Find the closest form content
        var originalPriceInput = saleFormContent.querySelector('#saleFiyat');
        var discountRateInput = event.target; // Get the specific input that triggered the event
        var discountedPriceSpan = saleFormContent.querySelector('#saleDiscountedPrice');

        var originalPrice = parseFloat(originalPriceInput.value);
        var discountRate = parseFloat(discountRateInput.value);

        if (isNaN(discountRate) || discountRate < 0) {
            alert("Doğru iskonto miktarı girdiğinize emin olun.");
            discountedPriceSpan.textContent = ''; // Clear the discounted price
            return;
        }

        if (!isNaN(originalPrice)) {
            var discountedPrice = originalPrice - (originalPrice * (discountRate / 100));
            // Ensure the discounted price does not go below a small positive threshold
            discountedPrice = discountedPrice <= 0 ? 0.00001 : discountedPrice;
            discountedPriceSpan.textContent = 'İskontolu Fiyat: ' + discountedPrice.toFixed(2) + ' TL';
        } else {
            discountedPriceSpan.textContent = '';
        }
    }
}

function validateDate(inputId) {
    var dateValue = $(`#${inputId}`).val();
    // Simple date validation for dd.mm.yyyy format
    var datePattern = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!datePattern.test(dateValue)) {
        alert("Lütfen tarihi gün/ay/yıl formatında girin.");
        return false;
    }
    return true;
}
