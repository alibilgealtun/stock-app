import sqlite3

from .db import get_connection

def get_all_stocks(db_path):
    connection = get_connection(db_path)
    cursor = connection.cursor()
    cursor.execute("SELECT OLIMPIA_KOD, STOK_ADI, MODEL, OZELLIK, ADET FROM STOK")
    data = cursor.fetchall()
    cursor.close()
    connection.close()
    return data

def get_stock_data_paginated(db_path, page, page_size):
    offset = (page - 1) * page_size
    connection = get_connection(db_path)
    cursor = connection.cursor()
    cursor.execute("SELECT OLIMPIA_KOD, STOK_ADI, MODEL, OZELLIK, ADET FROM STOK LIMIT ? OFFSET ?", (page_size, offset))
    stocks = cursor.fetchall()
    cursor.close()

    data = []
    for stock in stocks:
        stock_dict = dict(stock)
        # Fetch color and price details for each stock
        colors = get_colors_for_stock(db_path, stock['OLIMPIA_KOD'])
        stock_dict['colors_data'] = [{"renk_adi": c['renk_adi'], "fiyat": c['fiyat']} for c in colors]
        stock_dict['price_color'] = {c['fiyat']: c['renk_adi'] for c in colors}
        data.append(stock_dict)

    connection.close()
    return data

def get_colors_for_stock(db_path, olimpia_kod):
    connection = get_connection(db_path)
    cursor = connection.cursor()
    cursor.execute("SELECT renk_adi, fiyat FROM depo WHERE OLIMPIA_KOD = ?", (str(olimpia_kod),))
    colors = cursor.fetchall()
    cursor.close()
    connection.close()

    # Convert each row to a dictionary
    colors_list = [{'renk_adi': row['renk_adi'], 'fiyat': row['fiyat']} for row in colors]

    return colors_list

def add_product(db_path, data):
    connection = get_connection(db_path)
    cursor = connection.cursor()

    cursor.execute("SELECT OLIMPIA_KOD, ADET FROM DEPO WHERE OLIMPIA_KOD = ? AND RENK_ADI = ?",
                   (str(data['OLIMPIA_KOD']), data['RENK_ADI']))
    existing_product = cursor.fetchone()

    if existing_product:
        new_quantity = existing_product[1] + data['ADET']
        update_sql = "UPDATE DEPO SET ADET = ? WHERE OLIMPIA_KOD = ? AND RENK_ADI = ?"
        cursor.execute(update_sql, (new_quantity, str(data['OLIMPIA_KOD']), data['RENK_ADI']))
    else:
        insert_sql = """
        INSERT INTO DEPO (OLIMPIA_KOD, RENK_ADI, FIYAT, ADET)
        VALUES (?, ?, ?, ?)
        """
        insert_values = (
            str(data['OLIMPIA_KOD']), data['RENK_ADI'], data.get('FIYAT'), data.get('ADET')
        )
        cursor.execute(insert_sql, insert_values)

    connection.commit()
    cursor.close()
    connection.close()

def add_stock(db_path, data):
    connection = get_connection(db_path)
    cursor = connection.cursor()

    # Convert CIKMA to integer if necessary
    cikma_value = data.get('CIKMA')
    if cikma_value == 'on':
        cikma_value = 1
    else:
        cikma_value = int(cikma_value or 0)

    stok_sql = """
    INSERT INTO STOK (OLIMPIA_KOD, STOK_ADI, UY, KONUM, MODEL, OZELLIK, DELIK, ADET, EN, BOY, M2, MM, CIKMA)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    stok_values = (
        str(data['OLIMPIA_KOD']), data['STOK_ADI'], data['UY'], data['KONUM'], data['MODEL'],
        data['OZELLIK'], data['DELIK'], data.get('ADET'),
        data.get('EN'), data.get('BOY'), data.get('M2'), data.get('MM'),
        cikma_value
    )
    cursor.execute(stok_sql, stok_values)
    connection.commit()
    cursor.close()
    connection.close()



def update_stock(db_path, olimpia_kod, data):
    connection = get_connection(db_path)
    cursor = connection.cursor()

    valid_columns = {'STOK_ADI', 'UY', 'KONUM', 'MODEL', 'OZELLIK', 'DELIK', 'ADET', 'EN', 'BOY', 'M2', 'MM', 'CIKMA'}
    data = {k: v for k, v in data.items() if k in valid_columns}

    if 'CIKMA' in data:
        if data['CIKMA'] == 'on':
            data['CIKMA'] = 1
        else:
            data['CIKMA'] = int(data['CIKMA'] or 0)

    update_fields = []
    update_values = []

    for key, value in data.items():
        if value == '':
            value = None
        update_fields.append(f"{key} = ?")
        update_values.append(value)

    update_values.append(str(olimpia_kod))

    update_sql = f"""
    UPDATE STOK SET {', '.join(update_fields)} WHERE OLIMPIA_KOD = ?
    """

    cursor.execute(update_sql, tuple(update_values))
    connection.commit()

    if cursor.rowcount == 0:
        raise ValueError('Stock not found.')

    cursor.close()
    connection.close()




def delete_stock(db_path, olimpia_kod):
    connection = get_connection(db_path)
    cursor = connection.cursor()

    delete_sql = """
    DELETE FROM STOK WHERE OLIMPIA_KOD = ?
    """

    cursor.execute(delete_sql, (str(olimpia_kod),))
    connection.commit()

    if cursor.rowcount == 0:
        raise ValueError('Stock not found.')

    cursor.close()
    connection.close()

def get_stock_by_id(db_path, olimpia_kod):
    connection = get_connection(db_path)
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM STOK WHERE OLIMPIA_KOD = ?", (str(olimpia_kod),))
    stock = cursor.fetchone()
    cursor.close()
    connection.close()
    return dict(stock) if stock else None  # Convert to dict

def get_purchases_by_stock_id(db_path, olimpia_kod):
    connection = get_connection(db_path)
    cursor = connection.cursor()
    cursor.execute("SELECT ALIM_TARIHI, ADET, FIYAT, renk_adi FROM alim_bilgisi WHERE OLIMPIA_KOD = ?", (str(olimpia_kod),))
    purchases = cursor.fetchall()
    cursor.close()
    connection.close()
    return [dict(purchase) for purchase in purchases]  # Convert each Row to dict

def get_sales_by_stock_id(db_path, olimpia_kod):
    connection = get_connection(db_path)
    cursor = connection.cursor()
    cursor.execute("SELECT SATIS_TARIHI, ADET, FIYAT, renk_adi FROM satis_bilgisi WHERE OLIMPIA_KOD = ?", (str(olimpia_kod),))
    sales = cursor.fetchall()
    cursor.close()
    connection.close()
    return [dict(sale) for sale in sales]

def get_all_colors(db_path):
    connection = get_connection(db_path)
    cursor = connection.cursor()
    cursor.execute("SELECT renk_adi FROM renk")
    colors = cursor.fetchall()
    cursor.close()
    connection.close()
    return colors

def add_color(db_path, new_color):
    connection = get_connection(db_path)
    cursor = connection.cursor()

    cursor.execute("SELECT COUNT(*) FROM renk WHERE renk_adi = ?", (new_color,))
    result = cursor.fetchone()

    if result[0] > 0:
        raise ValueError('Color already exists.')

    color_sql = "INSERT INTO renk (renk_adi) VALUES (?)"
    cursor.execute(color_sql, (new_color,))
    connection.commit()
    cursor.close()
    connection.close()


def add_purchase(db_path, data):
    fields = ', '.join(data.keys())
    placeholders = ', '.join(['?'] * len(data))
    values = list(data.values())

    connection = get_connection(db_path)
    cursor = connection.cursor()

    cursor.execute("SELECT ADET FROM STOK WHERE OLIMPIA_KOD = ?", (data['OLIMPIA_KOD'],))
    current_stock = cursor.fetchone()

    if current_stock is None:
        current_stock = 0

    new_adet = current_stock['ADET'] + int(data['ADET'])

    cursor.execute("UPDATE STOK SET ADET = ? WHERE OLIMPIA_KOD = ?", (new_adet, data['OLIMPIA_KOD']))

    try:
        cursor.execute(f"INSERT INTO alim_bilgisi ({fields}) VALUES ({placeholders})", values)
        connection.commit()
    except sqlite3.Error as e:
        print(f"SQL Error: {e}")
        raise e
    finally:
        cursor.close()
        connection.close()


def add_sale(db_path, data):
    fields = ', '.join(data.keys())
    placeholders = ', '.join(['?'] * len(data))
    values = list(data.values())

    connection = get_connection(db_path)
    cursor = connection.cursor()

    cursor.execute("SELECT ADET FROM STOK WHERE OLIMPIA_KOD = ?", (data['OLIMPIA_KOD'],))
    current_stock = cursor.fetchone()

    if current_stock is None:
        current_stock = 0

    new_adet = current_stock['ADET'] - int(data['ADET'])

    if new_adet < 0:
        new_adet = 0

    cursor.execute("UPDATE STOK SET ADET = ? WHERE OLIMPIA_KOD = ?", (new_adet, data['OLIMPIA_KOD']))

    cursor.execute(f"INSERT INTO satis_bilgisi ({fields}) VALUES ({placeholders})", values)
    connection.commit()
    cursor.close()
    connection.close()


def get_stock_paginated_filtered(db_path, page, page_size, only_depo=False, only_cikma=False, search_query=''):
    offset = (page - 1) * page_size
    connection = get_connection(db_path)
    cursor = connection.cursor()

    # Modify the base query to include DELIK, M2, and KONUM
    base_query = """
    SELECT OLIMPIA_KOD, STOK_ADI, MODEL, OZELLIK, ADET, DELIK, M2, KONUM 
    FROM STOK 
    WHERE 1=1
    """

    if only_depo:
        base_query += " AND ADET > 0"

    if only_cikma:
        base_query += " AND CIKMA = 1"

    if search_query:
        base_query += " AND (STOK_ADI LIKE ? OR MODEL LIKE ? OR OZELLIK LIKE ?)"
        search_query = f"%{search_query}%"
        query = base_query + " LIMIT ? OFFSET ?"
        cursor.execute(query, (search_query, search_query, search_query, page_size, offset))
    else:
        query = base_query + " LIMIT ? OFFSET ?"
        cursor.execute(query, (page_size, offset))

    stocks = cursor.fetchall()
    cursor.close()
    connection.close()

    data = []
    for stock in stocks:
        stock_dict = dict(stock)
        colors = get_colors_for_stock(db_path, stock['OLIMPIA_KOD'])
        stock_dict['colors_data'] = [{"renk_adi": c['renk_adi'], "fiyat": c['fiyat']} for c in colors]
        data.append(stock_dict)
    return data

def search_across_all_data(db_path, query, limit=10, offset=0):
    try:
        connection = get_connection(db_path)
        cursor = connection.cursor()

        search_query = f"%{query}%"

        # SQL query with pagination
        sql = '''
        SELECT OLIMPIA_KOD, STOK_ADI, MODEL, OZELLIK, ADET 
        FROM STOK
        WHERE OLIMPIA_KOD LIKE ? OR STOK_ADI LIKE ? OR MODEL LIKE ? OR OZELLIK LIKE ?
        LIMIT ? OFFSET ?
        '''

        cursor.execute(sql, (search_query, search_query, search_query, search_query, limit, offset))
        results = cursor.fetchall()
        cursor.close()
        connection.close()

        return [dict(row) for row in results]

    except sqlite3.Error as e:
        print(f"SQL error: {e}")
        raise e
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise e







