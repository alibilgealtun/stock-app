import sqlite3

def initialize_db(db_path):
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS STOK (
        OLIMPIA_KOD INTEGER PRIMARY KEY AUTOINCREMENT,
        STOK_ADI TEXT,
        UY TEXT,
        KONUM TEXT,
        MODEL TEXT,
        OZELLIK TEXT,
        DELIK TEXT,
        ADET INTEGER,
        EN REAL,
        BOY REAL,
        M2 REAL,
        MM REAL
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS DEPO (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        OLIMPIA_KOD INTEGER,
        RENK_ADI TEXT,
        FIYAT REAL,
        FOREIGN KEY (OLIMPIA_KOD) REFERENCES STOK(OLIMPIA_KOD)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS renk (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        renk_adi TEXT UNIQUE
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS alim_bilgisi (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        OLIMPIA_KOD INTEGER,
        ALIM_TARIHI TEXT,
        ADET INTEGER,
        FIYAT REAL,
        renk_adi TEXT,
        FOREIGN KEY (OLIMPIA_KOD) REFERENCES STOK(OLIMPIA_KOD)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS satis_bilgisi (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        OLIMPIA_KOD INTEGER,
        SATIS_TARIHI TEXT,
        ADET INTEGER,
        FIYAT REAL,
        FOREIGN KEY (OLIMPIA_KOD) REFERENCES STOK(OLIMPIA_KOD)
    )
    ''')

    connection.commit()
    cursor.close()
    connection.close()

    print("Tables created successfully.")
