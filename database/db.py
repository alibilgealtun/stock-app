import sqlite3

def get_connection(db_path):
    """Get a connection to the SQLite database with Row factory set."""
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row  # This is crucial for accessing columns by name
    return connection
def create_stok_table(cursor):
    """Create the STOK table."""
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS STOK (
        OLIMPIA_KOD TEXT PRIMARY KEY,
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

def create_depo_table(cursor):
    """Create the DEPO table."""
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS DEPO (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        OLIMPIA_KOD TEXT,
        RENK_ADI TEXT,
        FIYAT REAL,
        FOREIGN KEY (OLIMPIA_KOD) REFERENCES STOK(OLIMPIA_KOD)
    )
    ''')

def create_renk_table(cursor):
    """Create the renk table."""
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS renk (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        renk_adi TEXT UNIQUE
    )
    ''')

def create_alim_bilgisi_table(cursor):
    """Create the alim_bilgisi table."""
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS alim_bilgisi (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        OLIMPIA_KOD TEXT,
        ALIM_TARIHI TEXT,
        ADET INTEGER,
        FIYAT REAL,
        renk_adi TEXT,
        FOREIGN KEY (OLIMPIA_KOD) REFERENCES STOK(OLIMPIA_KOD)
    )
    ''')

def create_satis_bilgisi_table(cursor):
    """Create the satis_bilgisi table."""
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS satis_bilgisi (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        OLIMPIA_KOD TEXT,
        SATIS_TARIHI TEXT,
        ADET INTEGER,
        FIYAT REAL,
        renk_adi TEXT,
        FOREIGN KEY (OLIMPIA_KOD) REFERENCES STOK(OLIMPIA_KOD)
    )
    ''')

def add_unique_constraint_to_depo(cursor):
    # Add a unique constraint on the combination of OLIMPIA_KOD and RENK_ADI
    cursor.execute('''
        CREATE UNIQUE INDEX IF NOT EXISTS unique_olimpia_renk
        ON DEPO (OLIMPIA_KOD, RENK_ADI)
    ''')


def initialize_db(db_path):
    """Initialize the database with all necessary tables."""
    connection = get_connection(db_path)
    cursor = connection.cursor()

    create_stok_table(cursor)
    create_depo_table(cursor)
    add_unique_constraint_to_depo(cursor)
    create_renk_table(cursor)
    create_alim_bilgisi_table(cursor)
    create_satis_bilgisi_table(cursor)

    connection.commit()
    cursor.close()
    connection.close()

    print("Tables created successfully.")
