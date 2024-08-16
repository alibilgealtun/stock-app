from database.queries import (
    get_all_stocks, get_colors_for_stock, add_stock,
    update_stock, delete_stock, get_stock_by_id, get_stock_data_paginated, search_across_all_data
)
from database.queries import get_stock_data_paginated as get_paginated_stocks
import sqlite3

def get_connection(db_path):
    """Get a connection to the SQLite database with Row factory set."""
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row  # This is crucial for accessing columns by name
    return connection

def get_all_stock_data(db_path):
    """Retrieve stock data along with associated color information."""
    stocks = get_all_stocks(db_path)

    colors_data = {
        stok['OLIMPIA_KOD']: [
            f"{color['renk_adi']}: {color['fiyat'] or ''}"
            for color in get_colors_for_stock(db_path, stok['OLIMPIA_KOD'])
        ]
        for stok in stocks
    }
    return stocks, colors_data


def get_stock_paginated(db_path, page, page_size):
    data = get_stock_data_paginated(db_path, page, page_size)
    return [dict(row) for row in data]

def add_new_stock(db_path, stock_data):
    """Add a new stock entry to the database."""
    add_stock(db_path, stock_data)

def update_existing_stock(db_path, olimpia_kod, stock_data):
    """Update an existing stock entry in the database."""
    update_stock(db_path, olimpia_kod, stock_data)

def delete_existing_stock(db_path, olimpia_kod):
    """Remove a stock entry from the database."""
    delete_stock(db_path, olimpia_kod)

def get_stock_details(db_path, olimpia_kod):
    """Retrieve details for a specific stock by its ID."""
    stock = get_stock_by_id(db_path, olimpia_kod)
    return dict(stock) if stock else None

def search_across_datas(db_path, query, page, page_size):
    return search_across_all_data(db_path, query, page, page_size)