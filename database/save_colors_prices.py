import pandas as pd
import sqlite3
from db import initialize_db
import numpy as np

# Initialize the database (if not already initialized)
db_path = '../olimpia.db'  # SQLite database file
initialize_db(db_path)  # Initialize the database tables

# Load the Excel file
file_path = '../OlimpiaLAST.XLSX'  # Update with the correct path
relevant_columns = ['OLIMPIA_KOD', 'BEYAZ', 'RENKLİ', 'ÇİFT RENK', 'K.YEŞİL K.GRİ']
df = pd.read_excel(file_path, usecols=relevant_columns, sheet_name='Sayfa1')

# Select only the relevant columns and drop rows where OLIMPIA_KOD is null
df_relevant = df[relevant_columns].dropna(subset=['OLIMPIA_KOD'])
renk_columns = relevant_columns[1:]

# Melt the DataFrame to have 'OLIMPIA_KOD', 'RENK_ADI', and 'FIYAT' columns
df_relevant_melted = df_relevant.melt(id_vars=['OLIMPIA_KOD'], value_vars=renk_columns, var_name='RENK_ADI', value_name='FIYAT')

# Filter out rows with NaN prices and remove duplicates
df_filtered = df_relevant_melted.dropna(subset=['FIYAT']).drop_duplicates(subset=['OLIMPIA_KOD', 'RENK_ADI'])

# Debug: Print the first few rows to check the data
print("Data to be inserted into DEPO:")
print(df_filtered.head())

# Establish a connection to the SQLite database
connection = sqlite3.connect(db_path)
cursor = connection.cursor()

# Function to upsert data into the 'DEPO' table
def upsert_depo(cursor, olimpia_kod, renk_adi, fiyat):
    try:
        cursor.execute('''
            INSERT INTO DEPO (OLIMPIA_KOD, RENK_ADI, FIYAT)
            VALUES (?, ?, ?)
            ON CONFLICT(OLIMPIA_KOD, RENK_ADI) DO UPDATE SET
                FIYAT=excluded.FIYAT
        ''', (olimpia_kod, renk_adi, fiyat))
    except sqlite3.IntegrityError as e:
        print(f"IntegrityError: {e} on data {olimpia_kod}, {renk_adi}, {fiyat}")
    except sqlite3.Error as e:
        print(f"SQLite Error: {e} on data {olimpia_kod}, {renk_adi}, {fiyat}")

# Insert or update each row into the DEPO table
for index, row in df_filtered.iterrows():
    olimpia_kod = row['OLIMPIA_KOD']
    renk_adi = row['RENK_ADI']
    fiyat = row['FIYAT']
    print(f"Inserting or updating row {index}: {row.to_dict()}")
    upsert_depo(cursor, olimpia_kod, renk_adi, fiyat)

# Commit the transaction
connection.commit()

# Close the connection
cursor.close()
connection.close()

print("Data inserted successfully.")
