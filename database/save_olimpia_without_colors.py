import pandas as pd
from sqlalchemy import create_engine

# Database connection details
db_user = 'root'
db_password = 'f1453e1980'
db_host = 'localhost'
db_name = 'olimpia'

# Create a connection string
connection_string = f"mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}"

# Create a database engine
engine = create_engine(connection_string)

# Load the Excel file
file_path = '../OlimpiaLAST.XLSX'  # Update with the correct path
df = pd.read_excel(file_path, sheet_name='Sayfa1')

# Data transformation (if needed)
df.columns = df.columns.str.strip()  # Strip any whitespace from column names

# Relevant columns to select
relevant_columns = ['OLIMPIA_KOD', 'STOK_ADI', 'UY', 'KONUM', 'MODEL', 'OZELLIK', 'DELIK', 'MM', 'EN', 'BOY']

# Select only the relevant columns and drop rows where OLIMPIA_KOD is null
df_relevant = df[relevant_columns].dropna(subset=['OLIMPIA_KOD'])



# Insert the data into the database table
# REPLACES THE CURRENT DATA IF PK ALREADY EXISTS (OLIMPIA_KOD) FOR THIS CASE.
df_relevant.to_sql('stok', con=engine, if_exists='replace', index=False)

print("Data inserted successfully.")
