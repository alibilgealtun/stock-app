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

    $("#searchInput").on("keyup", searchTable);
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
            $('#addStockContent').empty(); // Önceki form içeriğini temizle
            $('#addStockContent').append(`
                <label for="OLIMPIA_KOD">OLIMPIA KOD</label>
                <input type="text" id="OLIMPIA_KOD" name="OLIMPIA_KOD"><br>
                <label for="STOK_ADI">STOK ADI</label>
                <input type="text" id="STOK_ADI" name="STOK_ADI"><br>
                <label for="UY">ÜY</label>
                <input type="text" id="UY" name="UY"><br>
                <label for="KONUM">KONUM</label>
                <input type="text" id="KONUM" name="KONUM"><br>
                <label for="MODEL">MODEL</label>
                <input type="text" id="MODEL" name="MODEL"><br>
                <label for="OZELLIK">ÖZELLİK</label>
                <input type="text" id="OZELLIK" name="OZELLIK"><br>
                <label for="DELIK">DELİK</label>
                <input type="text" id="DELIK" name="DELIK"><br>
                <label for="MM">MM</label>
                <input type="text" id="MM" name="MM"><br>
                <label for="M2">EBAT</label>
                <input type="text" id="M2" name="M2"><br>
             <label for="RENK">RENK</label>
                <select id="RENK" name="RENK">
                    <!-- Mevcut renkler buraya yüklenecek -->
                </select>
                <br>
                <input type="text" id="newColor" placeholder="Yeni Renk Ekle">
                <button type="button" onclick="addNewColor()">Renk Ekle</button>
                <br>
                <label for="ISKONTO">ISKONTO</label>
                <input type="text" id="ISKONTO" name="ISKONTO"><br>
            `);
             $('#addStockContent').append(`<button type="button" class="save-btn" onclick="addStock()">KAYDET </button>`);
            loadColors();

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
                    var renkSelect = $('#saleRenk');
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
        }
    });
}
  function calculateDiscountedEbat(input) {
        var tr = input.closest('tr'); // İskonto inputunun bulunduğu tr satırını bul
        var ebatInput = tr.querySelector(".ebat-input"); // Aynı satırdaki ebat inputunu bul
        var ebat = parseFloat(ebatInput.value);
        var iskonto = parseFloat(input.value);

        if (!isNaN(iskonto) && iskonto >= 0 && iskonto <= 100) {
            var indirimliEbat = ebat * (100 - iskonto) / 100;
            ebatInput.value = indirimliEbat.toFixed(2); // Ebatı 2 ondalıklı göstermek için
        } else {
            alert("Lütfen geçerli bir indirim oranı girin (0-100 arası).");
        }
    }

// Modalı açmak için gereken kod
function openSaleModal(olimpiaKod) {
    var modal = document.getElementById("saleForm");
    var span = modal.querySelector(".close");
    var purchaseOlimpiaKod = modal.querySelector("#saleOlimpiaKod");

    purchaseOlimpiaKod.value = olimpiaKod; // OLIMPIA_KOD'u modal içindeki gizli input'a ata

    modal.style.display = "block"; // Modalı göster
    span.onclick = function () {
        modal.style.display = "none"; // Modalın kapatılması için X simgesine basıldığında
    }
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none"; // Modalın kapatılması için dışarıya tıklanıldığında
        }
    }
}

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