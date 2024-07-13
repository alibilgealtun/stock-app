import pandas as pd
from sqlalchemy import create_engine, Table, Column, Integer, String, Float, MetaData
from sqlalchemy.dialects.mysql import insert
import logging

# SQLAlchemy loglarını aktifleştirme
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# Database connection details
db_user = 'root'
db_password = 'f1453e1980'
db_host = 'localhost'
db_name = 'olimpia'

# Create a connection string
connection_string = f"mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}"

# Create a database engine
engine = create_engine(connection_string)
metadata = MetaData()

# Load the Excel file
file_path = '../OlimpiaLAST.XLSX'  # Update with the correct path
relevant_columns = ['OLIMPIA_KOD', 'BEYAZ', 'RENKLİ', 'ÇİFT RENK', 'K.YEŞİL K.GRİ']
df = pd.read_excel(file_path, usecols=relevant_columns, sheet_name='Sayfa1')

# 'depo' tablosunu tanımlama
depo = Table('depo', metadata,
             Column('STOK_KODU', Integer, primary_key=True, autoincrement=True),
             Column('OLIMPIA_KOD', String(50), nullable=False),
             Column('ALIS_KODU', Integer, nullable=True),
             Column('SATIS_KODU', Integer, nullable=True),
             Column('RENK_ADI', String(45), nullable=True),
             Column('FIYAT', Float, nullable=True),
             extend_existing=True)
metadata.create_all(engine)

# Select only the relevant columns and drop rows where OLIMPIA_KOD is null
df_relevant = df[relevant_columns].dropna(subset=['OLIMPIA_KOD'])
renk_columns = relevant_columns[1:]
# Gruplama ve sadece bir kaydı bırakma
df_relevant_melted = df_relevant.melt(id_vars=['OLIMPIA_KOD'], value_vars=renk_columns, var_name='RENK_ADI', value_name='FIYAT')
df_filtered = df_relevant_melted.dropna(subset=['FIYAT'])
df_filtered = df_filtered.drop_duplicates(subset=['OLIMPIA_KOD', 'RENK_ADI'])

def upsert_depo(connection, table, olimpia_kod, renk_adi, fiyat):
    stmt = insert(table).values(OLIMPIA_KOD=olimpia_kod, RENK_ADI=renk_adi, FIYAT=fiyat)
    update_dict = {'RENK_ADI': renk_adi, 'FIYAT': fiyat}
    stmt = stmt.on_duplicate_key_update(update_dict)
    try:
        connection.execute(stmt)
    except Exception as e:
        print(f"Error inserting {olimpia_kod}, {renk_adi}, {fiyat}: {e}")

# Veritabanına veri ekleme
renk_columns = ['BEYAZ', 'RENKLİ', 'ÇİFT RENK', 'K.YEŞİL K.GRİ']
connection = engine.connect()

transaction = connection.begin()
try:
    for _, row in df_filtered.iterrows():
        olimpia_kod = row['OLIMPIA_KOD']
        renk_adi = row['RENK_ADI']
        fiyat = row['FIYAT']
        #print(olimpia_kod, renk_adi, fiyat)
        upsert_depo(connection, depo, olimpia_kod, renk_adi, fiyat)
    transaction.commit()
    print("Data inserted successfully.")
except Exception as e:
    print(f"Transaction failed: {e}")
    transaction.rollback()
finally:
    connection.close()
