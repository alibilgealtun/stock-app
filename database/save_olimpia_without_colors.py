import pandas as pd
import sqlite3
from db import initialize_db
import numpy as np


def clean_numeric_column(column):
    """Convert valid numbers and mathematical expressions to floats, others to NaN."""

    def convert_value(value):
        try:
            if isinstance(value, tuple):
                return np.nan  # or handle tuples appropriately if needed
            elif isinstance(value, str):
                # Safely evaluate if it contains a mathematical expression
                return float(eval(value)) if any(op in value for op in '+-*/') else float(value)
            else:
                return float(value)
        except (ValueError, SyntaxError, TypeError):
            return np.nan  # or return 0 or some other default value

    return column.apply(convert_value)


# Database connection details
db_path = '../olimpia.db'  # SQLite database file
initialize_db(db_path)  # Initialize the database tables

# Load the Excel file
file_path = '../OlimpiaLAST.XLSX'  # Update with the correct path
df = pd.read_excel(file_path, sheet_name='Sayfa1')

# Data transformation (if needed)
df.columns = df.columns.str.strip()  # Strip any whitespace from column names

# Relevant columns to select
relevant_columns = ['OLIMPIA_KOD', 'STOK_ADI', 'UY', 'KONUM', 'MODEL', 'OZELLIK', 'DELIK', 'MM', 'EN', 'BOY']

# Select only the relevant columns and drop rows where OLIMPIA_KOD is null
df_relevant = df[relevant_columns].dropna(subset=['OLIMPIA_KOD'])

# Clean and convert the numeric columns
df_relevant['MM'] = clean_numeric_column(df_relevant['MM'])
df_relevant['EN'] = clean_numeric_column(df_relevant['EN'])
df_relevant['BOY'] = clean_numeric_column(df_relevant['BOY'])

# Handle NaN values in the dataframe (e.g., replace with zeros)
df_relevant.fillna({
    'STOK_ADI': '',
    'UY': '',
    'KONUM': '',
    'MODEL': '',
    'OZELLIK': '',
    'DELIK': '',
    'MM': 0,
    'EN': 0,
    'BOY': 0
}, inplace=True)

# Debug: Print the first few rows to check the data
print("Data to be inserted:")
print(df_relevant.head())

# Establish a connection to the SQLite database
connection = sqlite3.connect(db_path)
cursor = connection.cursor()

# Insert the data into the 'STOK' table, replacing if OLIMPIA_KOD already exists
for index, row in df_relevant.iterrows():
    try:
        # Debug: Print the row to be inserted
        print(f"Inserting row {index}: {row.to_dict()}")

        cursor.execute('''
            INSERT INTO STOK (OLIMPIA_KOD, STOK_ADI, UY, KONUM, MODEL, OZELLIK, DELIK, MM, EN, BOY)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(OLIMPIA_KOD) DO UPDATE SET
                STOK_ADI=excluded.STOK_ADI,
                UY=excluded.UY,
                KONUM=excluded.KONUM,
                MODEL=excluded.MODEL,
                OZELLIK=excluded.OZELLIK,
                DELIK=excluded.DELIK,
                MM=excluded.MM,
                EN=excluded.EN,
                BOY=excluded.BOY
        ''', (row['OLIMPIA_KOD'], row['STOK_ADI'], row['UY'], row['KONUM'], row['MODEL'], row['OZELLIK'],
              row['DELIK'], row['MM'], row['EN'], row['BOY']))
    except sqlite3.IntegrityError as e:
        print(f"IntegrityError: {e} on row {index}: {row.to_dict()}")
    except sqlite3.Error as e:
        print(f"SQLite Error: {e} on row {index}: {row.to_dict()}")

# Commit the transaction
connection.commit()

# Close the connection
cursor.close()
connection.close()

print("Data inserted successfully.")
