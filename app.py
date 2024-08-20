from flask import Flask, request, jsonify, render_template
from config import config
from database.queries import get_stock_paginated_filtered
from services.stock_service import (
    add_new_stock, update_existing_stock,
    delete_existing_stock, get_stock_details, get_stock_data_paginated, get_stock_paginated, search_across_datas, get_colors_for_stock_id
)
from services.product_service import add_new_product
from services.color_service import get_colors, add_new_color
from services.purchase_service import add_new_purchase, get_purchases_for_stock
from services.sale_service import add_new_sale, get_sales_for_stock
from flask_caching import Cache

app = Flask(__name__)

cache = Cache(app, config={'CACHE_TYPE': 'simple'})


@app.route('/')
def index():
    try:
        page = request.args.get('page', 1, type=int)  # Get the current page number
        page_size = 10  # Number of items per page
        only_depo = request.args.get('only_depo', 'false').lower() == 'true'  # Get the depo filter state

        # Fetch the data considering the only_depo filter
        data = get_stock_paginated_filtered(config.DB_PATH, page, page_size, only_depo)
        colors_data = get_colors(config.DB_PATH)

        return render_template('index.html', data=data, colors_data=colors_data, page=page)
    except Exception as err:
        print(err)
        return jsonify({'error': str(err)}), 500




@app.route('/get_stocks_paginated')
@cache.cached(timeout=60, query_string=True)
def get_stocks_paginated():
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('page_size', 10, type=int)
    only_depo = request.args.get('only_depo', 'false').lower() == 'true'
    search_query = request.args.get('query', '', type=str)

    data = get_stock_paginated_filtered(config.DB_PATH, page, page_size, only_depo, search_query)
    return jsonify(data)


@app.route('/search', methods=['GET'])
def search():
    try:
        query = request.args.get('query', '', type=str)

        data = search_across_datas(config.DB_PATH, query )
        return jsonify(data), 200
    except Exception as err:
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

@app.route('/update_stock/<string:olimpia_kod>', methods=['PUT'])
def update_stock(olimpia_kod):
    try:
        data = request.form.to_dict()
        update_existing_stock(config.DB_PATH, olimpia_kod, data)
        return jsonify({'message': 'Stok başarıyla güncellendi.'}), 200
    except ValueError:
        return jsonify({'error': 'Stock not found.'}), 404
    except Exception as err:
        return jsonify({'error': str(err)}), 500

@app.route('/delete_stock/<string:olimpia_kod>', methods=['DELETE'])
def delete_stock(olimpia_kod):
    try:
        delete_existing_stock(config.DB_PATH, olimpia_kod)
        return jsonify({'message': 'Stok başarıyla silindi.'}), 200
    except ValueError:
        return jsonify({'error': 'Stok bulunamadı.'}), 404
    except Exception as err:
        return jsonify({'error': str(err)}), 500


@app.route('/get_stock/<string:olimpia_kod>', methods=['GET'])
def get_stock(olimpia_kod):
    try:
        stok = get_stock_details(config.DB_PATH, olimpia_kod)
        if not stok:
            return jsonify({'error': 'Stok bulunamadı.'}), 404

        # Fetch purchase and sale details
        purchases = get_purchases_for_stock(config.DB_PATH, olimpia_kod)
        sales = get_sales_for_stock(config.DB_PATH, olimpia_kod)

        # Include these details in the response
        response_data = {
            'stock': dict(stok),
            'purchases': [dict(purchase) for purchase in purchases],
            'sales': [dict(sale) for sale in sales]
        }

        return jsonify(response_data), 200
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
        data = request.get_json()

        if 'RENK' in data:
            data['renk_adi'] = data.pop('RENK')
        if 'ALIM_TARIHI' in data:
            data['ALIM_TARIHI'] = data.pop('ALIM_TARIHI')

        if not data:
            return jsonify({"error": "Satış verisi yok."}), 400

        add_new_purchase(config.DB_PATH, data)
        return jsonify({"message": "Alış eklendi"}), 201
    except Exception as err:
        return jsonify({'error': str(err)}), 500

@app.route('/add_sale', methods=['POST'])
def add_sale_route():
    try:
        data = request.get_json()
        if 'RENK' in data:
            data['renk_adi'] = data.pop('RENK')
        add_new_sale(config.DB_PATH, data)
        return jsonify({"message": "Satış eklendi"}), 201
    except Exception as err:
        print("Error in add_sale_route:", err)  # Log the error
        return jsonify({'error': str(err)}), 500

@app.route('/get_purchases/<string:olimpia_kod>', methods=['GET'])
def get_purchases(olimpia_kod):
    try:
        purchases = get_purchases_for_stock(config.DB_PATH, olimpia_kod)
        if not purchases:
            return jsonify({'error': 'Alım bilgisi bulunamadı.'}), 404
        return jsonify([dict(purchase) for purchase in purchases]), 200
    except Exception as err:
        return jsonify({'error': str(err)}), 500

@app.route('/get_colors/<string:olimpia_kod>', methods=['GET'])
def get_colors_for_stock(olimpia_kod):
    try:
        colors = get_colors_for_stock_id(config.DB_PATH, olimpia_kod)
        return jsonify(colors)
    except Exception as e:
        return jsonify({'error': str(e)})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5130, debug=True)
