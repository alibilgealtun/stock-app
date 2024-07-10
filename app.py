from flask import Flask, request, jsonify, render_template
import mysql.connector

app = Flask(__name__)

db_config = {
    'user': 'root',
    'password': 'f1453e1980',
    'host': 'localhost',
    'database': 'olimpia'
}
@app.route('/')
def index():
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT * FROM STOK")
        data = cursor.fetchall()

        return render_template('index.html', data=data)

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/add_product', methods=['POST'])
def add_product():
    data = request.json
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Check if a product with the same OLIMPIA_KOD and RENK_ADI already exists
        cursor.execute("SELECT STOK_KODU, ADET FROM URUN WHERE OLIMPIA_KOD = %s AND RENK_ADI = %s", (data['OLIMPIA_KOD'], data['RENK_ADI']))
        existing_product = cursor.fetchone()

        if existing_product:
            # If the product already exists, update the quantity
            new_quantity = existing_product[1] + data['ADET']
            update_sql = "UPDATE URUN SET ADET = %s WHERE STOK_KODU = %s"
            cursor.execute(update_sql, (new_quantity, existing_product[0]))
            connection.commit()
            return jsonify({'message': 'Ürün miktarı güncellendi.'}), 200
        else:
            # Insert a new entry with auto-incremented STOK_KODU
            insert_sql = """
            INSERT INTO URUN (OLIMPIA_KOD, FIYAT, ALIS_KODU, SATIS_KODU, ADET, RENK_ADI)
            VALUES (%s, %s, %s, %s, %s, %s)
            """
            insert_values = (
                data['OLIMPIA_KOD'], data.get('FIYAT'), data.get('ALIS_KODU', None),  # ALIS_KODU null olabilir
                data.get('SATIS_KODU'), data['ADET'], data['RENK_ADI']
            )
            cursor.execute(insert_sql, insert_values)
            connection.commit()

            return jsonify({'message': 'Ürün başarıyla eklendi.'}), 201

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        connection.close()
@app.route('/add_stock', methods=['POST'])
def add_stock():
    data = request.json
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Stok ekleme
        stok_sql = """
        INSERT INTO STOK (OLIMPIA_KOD, STOK_ADI, UY, KONUM, MODEL, OZELLIK, DELIK, ADET, EN, BOY, M2, MM)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        stok_values = (
            data['OLIMPIA_KOD'], data['STOK_ADI'], data['UY'], data['KONUM'], data['MODEL'],
            data['OZELLIK'], data['DELIK'], data.get('ADET'),  # ADET nullable olabilir
            data.get('EN'), data.get('BOY'), data.get('M2'), data.get('MM')
        )
        cursor.execute(stok_sql, stok_values)
        connection.commit()

        return jsonify({'message': 'Stok başarıyla eklendi.'}), 201
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/update_stock/<int:olimpia_kod>', methods=['PUT'])
def update_stock(olimpia_kod):
    data = request.form.to_dict()
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        update_fields = []
        update_values = []

        for key, value in data.items():
            update_fields.append(f"{key} = %s")
            update_values.append(value)

        update_values.append(olimpia_kod)

        update_sql = f"""
        UPDATE STOK SET {', '.join(update_fields)} WHERE OLIMPIA_KOD = %s
        """

        cursor.execute(update_sql, tuple(update_values))
        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'Stock not found.'}), 404

        return jsonify({'message': 'Stock successfully updated.'}), 200

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

    finally:
        cursor.close()
        connection.close()


@app.route('/delete_stock/<int:olimpia_kod>', methods=['DELETE'])
def delete_stock(olimpia_kod):
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        delete_sql = """
        DELETE FROM STOK WHERE OLIMPIA_KOD = %s
        """

        cursor.execute(delete_sql, (olimpia_kod,))
        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'Stok bulunamadı.'}), 404

        return jsonify({'message': 'Stok başarıyla silindi.'}), 200
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/get_stock/<int:olimpia_kod>', methods=['GET'])
def get_stock(olimpia_kod):
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT * FROM STOK WHERE OLIMPIA_KOD = %s", (olimpia_kod,))
        stok = cursor.fetchone()

        if not stok:
            return jsonify({'error': 'Stok bulunamadı.'}), 404

        return jsonify(stok), 200
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        connection.close()


@app.route('/get_colors', methods=['GET'])
def get_colors():
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        cursor.execute("SELECT renk_adi FROM renk")
        renkler = cursor.fetchall()

        return jsonify(renkler)
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/add_color', methods=['POST'])
def add_color():
    data = request.json
    new_color = data.get('color')
    if not new_color:
        return jsonify({'error': 'Renk bilgisi eksik.'}), 400

    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        color_sql = "INSERT INTO renk (renk_adi) VALUES (%s)"
        cursor.execute(color_sql, (new_color,))
        connection.commit()

        return jsonify({'message': 'Renk başarıyla eklendi.'}), 201
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        connection.close()



if __name__ == '__main__':
    app.run(debug=True)
