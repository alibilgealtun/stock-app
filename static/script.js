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
    $.ajax({
        url: '/update_stock/' + stokId,
        type: 'PUT',
        data: formData,
        contentType: 'application/x-www-form-urlencoded',
        success: function(response) {
            alert(response.message);
            $('#editForm').css('display', 'none');
            location.reload();
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
            <label for="OLIMPIA_KOD">OLIMPIA KOD</label>
            <input type="text" id="OLIMPIA_KOD" name="OLIMPIA_KOD">
        </div>
        <div class="form-field">
            <label for="STOK_ADI">STOK ADI</label>
            <input type="text" id="STOK_ADI" name="STOK_ADI">
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

function loadColorsSale() {
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

function addNewColorSale() {
    var newColor = $('#newColorSale').val();
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

function addStock() {
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
            // Başarıyla ekledikten sonra sayfayı yenile
            window.location.reload();
        },
        error: function(err) {
            console.error('Hata:', err);
            alert('Stok eklenirken bir hata oluştu.');
        }
    });
}

function submitPurchaseForm() {
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

// Modalı açmak için gereken kod
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


// Satış ekle butonlarına tıklanma olayını dinlemek için
var saleButtons = document.querySelectorAll(".add-sale-btn");
saleButtons.forEach(function(button) {
    button.addEventListener("click", function(event) {
        var olimpiaKod = event.currentTarget.getAttribute("data-stok-id");
        openSaleModal(olimpiaKod); // Modalı aç
    });
});

// Modalı kapatmak için
var closeButtons = document.getElementsByClassName("close");
for (var i = 0; i < closeButtons.length; i++) {
    closeButtons[i].onclick = function() {
        var modal = this.parentElement.parentElement;
        modal.style.display = "none";
    }
}

// Kullanıcı başka yere tıkladığında modalları kapat
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

// İskonto uygulama fonksiyonu
function applyDiscount(row) {
    var iskontoMiktari = parseFloat(row.querySelector('.iskonto-input').value);
    if (isNaN(iskontoMiktari) ||iskontoMiktari <0){
        alert("Doğru iskonto miktarı girdiğinize emin olun.")
        return;
    }

    // Row içindeki renk ve fiyat listesindeki her bir öğeyi döngüyle işleyelim
    var renkFiyatListesi = row.querySelectorAll('.renkFiyatItem');
    renkFiyatListesi.forEach(function(item) {
        var renkSpan = item.querySelector('.renk');

        var fiyatSpan = item.querySelector('.fiyat');
        // console.log(fiyatSpan);
        // Eğer fiyat varsa işlem yapalım
        if (fiyatSpan && !isNaN(parseFloat(fiyatSpan.textContent))) {
            var orijinalFiyat = parseFloat(item.dataset.originalPrice);
            var indirimliFiyat = orijinalFiyat - (orijinalFiyat * (iskontoMiktari / 100));
            if (indirimliFiyat<=0){
                fiyatSpan.textContent=0.00001.toFixed(2);
            }else{
            // Yeni fiyatı HTML içine yerleştirelim
            fiyatSpan.textContent =  indirimliFiyat.toFixed(2);
            }
        } else {
            // Eğer fiyat yoksa boş bir değer yerleştirelim
            item.textContent = renkSpan.textContent+':';
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

