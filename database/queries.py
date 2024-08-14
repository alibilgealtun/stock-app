from .db import get_connection

def get_all_stocks(db_path):
    """Get all stocks from the database."""
    connection = get_connection(db_path)
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM STOK")
    data = cursor.fetchall()
    cursor.close()
    connection.close()
    return data

def get_colors_for_stock(db_path, olimpia_kod):
    """Fetch all colors for a given OLIMPIA_KOD from the DEPO table."""
    connection = get_connection(db_path)
    cursor = connection.cursor()
    cursor.execute("SELECT renk_adi, fiyat FROM depo WHERE OLIMPIA_KOD = ?", (olimpia_kod,))
    colors = cursor.fetchall()
    cursor.close()
    connection.close()
    return colors

def add_product(db_path, data):
    """Add a new product to the DEPO table."""
    connection = get_connection(db_path)
    cursor = connection.cursor()

    cursor.execute("SELECT OLIMPIA_KOD, ADET FROM DEPO WHERE OLIMPIA_KOD = ? AND RENK_ADI = ?",
                   (data['OLIMPIA_KOD'], data['RENK_ADI']))
    existing_product = cursor.fetchone()

    if existing_product:
        new_quantity = existing_product[1] + data['ADET']
        update_sql = "UPDATE DEPO SET ADET = ? WHERE OLIMPIA_KOD = ? AND RENK_ADI = ?"
        cursor.execute(update_sql, (new_quantity, data['OLIMPIA_KOD'], data['RENK_ADI']))
    else:
        insert_sql = """
        INSERT INTO DEPO (OLIMPIA_KOD, RENK_ADI, FIYAT)
        VALUES (?, ?, ?)
        """
        insert_values = (
            data['OLIMPIA_KOD'], data['RENK_ADI'], data.get('FIYAT')
        )
        cursor.execute(insert_sql, insert_values)

    connection.commit()
    cursor.close()
    connection.close()

def add_stock(db_path, data):
    """Add a new stock to the STOK table."""
    connection = get_connection(db_path)
    cursor = connection.cursor()
    stok_sql = """
    INSERT INTO STOK (STOK_ADI, UY, KONUM, MODEL, OZELLIK, DELIK, ADET, EN, BOY, M2, MM)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    stok_values = (
        data['STOK_ADI'], data['UY'], data['KONUM'], data['MODEL'],
        data['OZELLIK'], data['DELIK'], data.get('ADET'),
        data.get('EN'), data.get('BOY'), data.get('M2'), data.get('MM')
    )
    cursor.execute(stok_sql, stok_values)
    connection.commit()
    cursor.close()
    connection.close()

def update_stock(db_path, olimpia_kod, data):
    """Update an existing stock in the STOK table."""
    connection = get_connection(db_path)
    cursor = connection.cursor()

    update_fields = []
    update_values = []

    for key, value in data.items():
        if value == '':
            value = None
        update_fields.append(f"{key} = ?")
        update_values.append(value)

    update_values.append(olimpia_kod)

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
    """Delete a stock from the STOK table."""
    connection = get_connection(db_path)
    cursor = connection.cursor()

    delete_sql = """
    DELETE FROM STOK WHERE OLIMPIA_KOD = ?
    """

    cursor.execute(delete_sql, (olimpia_kod,))
    connection.commit()

    if cursor.rowcount == 0:
        raise ValueError('Stock not found.')

    cursor.close()
    connection.close()

def get_stock_by_id(db_path, olimpia_kod):
    """Fetch a specific stock entry by OLIMPIA_KOD."""
    connection = get_connection(db_path)
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM STOK WHERE OLIMPIA_KOD = ?", (olimpia_kod,))
    stock = cursor.fetchone()
    cursor.close()
    connection.close()
    return stock

def get_all_colors(db_path):
    """Fetch all colors from the renk table."""
    connection = get_connection(db_path)
    cursor = connection.cursor()
    cursor.execute("SELECT renk_adi FROM renk")
    colors = cursor.fetchall()
    cursor.close()
    connection.close()
    return colors

def add_color(db_path, new_color):
    """Add a new color to the renk table."""
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
    """Add a new purchase to the alim_bilgisi table."""
    fields = ', '.join(data.keys())
    placeholders = ', '.join(['?'] * len(data))
    values = list(data.values())

    connection = get_connection(db_path)
    cursor = connection.cursor()
    cursor.execute(f"INSERT INTO alim_bilgisi ({fields}) VALUES ({placeholders})", values)
    connection.commit()
    cursor.close()
    connection.close()

def add_sale(db_path, data):
    """Add a new sale to the satis_bilgisi table."""
    fields = ', '.join(data.keys())
    placeholders = ', '.join(['?'] * len(data))
    values = list(data.values())

    connection = get_connection(db_path)
    cursor = connection.cursor()
    cursor.execute(f"INSERT INTO satis_bilgisi ({fields}) VALUES ({placeholders})", values)
    connection.commit()
    cursor.close()
    connection.close()

def get_purchases_by_stock_id(db_path, olimpia_kod):
    """Fetch all purchases for a given OLIMPIA_KOD."""
    connection = get_connection(db_path)
    cursor = connection.cursor()
    cursor.execute("SELECT ALIM_TARIHI, ADET, FIYAT, renk_adi FROM alim_bilgisi WHERE OLIMPIA_KOD = ?", (olimpia_kod,))
    purchases = cursor.fetchall()
    cursor.close()
    connection.close()
    return purchases
