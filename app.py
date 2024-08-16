from flask import Flask, request, jsonify, render_template
from config import config
from services.stock_service import (
    get_stock_data, add_new_stock, update_existing_stock,
    delete_existing_stock, get_stock_details
)
from services.product_service import add_new_product
from services.color_service import get_colors, add_new_color
from services.purchase_service import add_new_purchase, get_purchases_for_stock
from services.sale_service import add_new_sale

app = Flask(__name__)

@app.route('/')
def index():
    try:
        data, colors_data = get_stock_data(config.DB_PATH)
        return render_template('index.html', data=data, colors_data=colors_data)
    except Exception as err:
        print(err)
        return jsonify({'error': str(err)}), 500

@app.route('/add_product', methods=['POST'])
def add_product():
    try:
        data = request.json
        add_new_product(config.DB_PATH, data)
        return jsonify({'message': 'Ürün başarıyla eklendi.'}), 201
    except Exception as err:
        return jsonify({'error': str(err)}), 500

@app.route('/add_stock', methods=['POST'])
def add_stock():
    try:
        data = request.json
        add_new_stock(config.DB_PATH, data)
        return jsonify({'message': 'Stok başarıyla eklendi.'}), 201
    except Exception as err:
        return jsonify({'error': str(err)}), 500

@app.route('/update_stock/<int:olimpia_kod>', methods=['PUT'])
def update_stock(olimpia_kod):
    try:
        data = request.form.to_dict()
        update_existing_stock(config.DB_PATH, olimpia_kod, data)
        return jsonify({'message': 'Stok başarıyla güncellendi.'}), 200
    except ValueError:
        return jsonify({'error': 'Stock not found.'}), 404
    except Exception as err:
        return jsonify({'error': str(err)}), 500

@app.route('/delete_stock/<int:olimpia_kod>', methods=['DELETE'])
def delete_stock(olimpia_kod):
    try:
        delete_existing_stock(config.DB_PATH, olimpia_kod)
        return jsonify({'message': 'Stok başarıyla silindi.'}), 200
    except ValueError:
        return jsonify({'error': 'Stok bulunamadı.'}), 404
    except Exception as err:
        return jsonify({'error': str(err)}), 500

@app.route('/get_stock/<int:olimpia_kod>', methods=['GET'])
def get_stock(olimpia_kod):
    try:
        stok = get_stock_details(config.DB_PATH, olimpia_kod)
        if not stok:
            return jsonify({'error': 'Stok bulunamadı.'}), 404
        return jsonify(dict(stok)), 200
    except Exception as err:
        return jsonify({'error': str(err)}), 500

@app.route('/get_colors', methods=['GET'])
def get_colors_route():
    try:
        colors = get_colors(config.DB_PATH)
        return jsonify([color['renk_adi'] for color in colors])
    except Exception as err:
        return jsonify({'error': str(err)}), 500

@app.route('/add_color', methods=['POST'])
def add_color_route():
    data = request.json
    new_color = data.get('color')

    if not new_color:
        return jsonify({'error': 'Renk bilgisi eksik.'}), 400

    try:
        add_new_color(config.DB_PATH, new_color)
        return jsonify({'message': 'Renk başarıyla eklendi.'}), 201
    except ValueError:
        return jsonify({'error': 'Bu renk zaten mevcut.'}), 400
    except Exception as err:
        return jsonify({'error': str(err)}), 500

@app.route('/add_purchase', methods=['POST'])
def add_purchase_route():
    try:
        data = request.form.to_dict()
        if 'RENK' in data:
            data['renk_adi'] = data.pop('RENK')
        if 'Tarih' in data:
            data['ALIM_TARIHI'] = data.pop('Tarih')
        add_new_purchase(config.DB_PATH, data)
        return jsonify({"message": "Alış eklendi"}), 201
    except Exception as err:
        return jsonify({'error': str(err)}), 500

@app.route('/add_sale', methods=['POST'])
def add_sale_route():
    try:
        data = request.form.to_dict()
        add_new_sale(config.DB_PATH, data)
        return jsonify({"message": "Satış eklendi"}), 201
    except Exception as err:
        return jsonify({'error': str(err)}), 500

@app.route('/get_purchases/<int:olimpia_kod>', methods=['GET'])
def get_purchases(olimpia_kod):
    try:
        purchases = get_purchases_for_stock(config.DB_PATH, olimpia_kod)
        if not purchases:
            return jsonify({'error': 'Alım bilgisi bulunamadı.'}), 404
        return jsonify([dict(purchase) for purchase in purchases]), 200
    except Exception as err:
        return jsonify({'error': str(err)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5130, debug=True)
