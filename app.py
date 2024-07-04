from flask import Flask, render_template, request, jsonify
import pymysql

app = Flask(__name__)

def get_db_connection():
    return pymysql.connect(
        host='localhost',
        user='root',
        password='f1453e1980',
        db='olimpia',
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

@app.route('/')
def index():
    connection = get_db_connection()
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM stock")
        stoklar = cursor.fetchall()

    connection.close()
    return render_template('index.html', stoklar=stoklar)


@app.route('/update', methods=['POST'])
def update():
    try:
        data = request.json
        olympia_kod = data['stok_id']  # stok_id is olimpia_kod
        field_name = data['field_name']
        new_value = data['new_value']
        print("Updating record with OLİMPİA_KOD:", olympia_kod)
        print("Field to update:", field_name)
        print("New value:", new_value)
        connection = get_db_connection()
        if olympia_kod==('None'):
            print("Olympia kod is null! Not posssible to update.")
            return jsonify(success=False), 500
        with connection.cursor() as cursor:
            # Use backticks to handle column names with special characters
            sql = f"UPDATE stock SET `{field_name}` = %s WHERE `OLİMPİA_KOD` = %s"
            print("SQL Query:", cursor.mogrify(sql, (new_value, olympia_kod)))
            cursor.execute(sql, (new_value, olympia_kod))
            connection.commit()
        connection.close()
        return jsonify(success=True)
    except Exception as e:
        print('Error:', e)
        return jsonify(success=False), 500



if __name__ == '__main__':
    app.run(debug=True)
