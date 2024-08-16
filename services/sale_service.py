from database.queries import add_sale, get_sales_by_stock_id

def add_new_sale(db_path, data):
    """Add a new sale."""
    add_sale(db_path, data)

def get_sales_for_stock(db_path, olimpia_kod):
    """Get purchases for a specific stock."""
    return get_sales_by_stock_id(db_path, olimpia_kod)