import pandas as pd
from sqlalchemy import create_engine

# Load your Excel file into a DataFrame
excel_file = '../olimpia3.XLSX'
df = pd.read_excel(excel_file)

# Preprocess the DataFrame to handle grouping under 'STOK ADI'
grouped_data = []
current_key = None

for index, row in df.iterrows():
    if pd.notna(row['STOK ADI']):
        # Found a new key
        current_key = row['STOK ADI']
        grouped_data.append(row)
    elif current_key is not None:
        # Append to the previous key group
        grouped_data[-1] = pd.concat([grouped_data[-1], row.dropna()])

# Convert the grouped data into a new DataFrame
processed_df = pd.DataFrame(grouped_data)

# Veritabanı bağlantı bilgileri
db_user = 'root'
db_password = 'f1453e1980'
db_host = 'localhost'
db_name = 'olimpia'

engine = create_engine(f'mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}')

# Write the processed DataFrame to MySQL database
processed_df.to_sql('stock', con=engine, if_exists='replace', index=False)


# to update 3 ebat columns as 1
# UPDATE stock
# SET EBAT = CONCAT(COALESCE(ebat1, ''), ' ', COALESCE(EBAT, ''), ' ', COALESCE(ebat2, ''));


print("Veri başarıyla veritabanına aktarıldı.")
