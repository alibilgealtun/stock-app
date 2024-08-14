from database.queries import add_purchase, get_purchases_by_stock_id

def add_new_purchase(db_path, data):
    """Add a new purchase."""
    add_purchase(db_path, data)

def get_purchases_for_stock(db_path, olimpia_kod):
    """Get purchases for a specific stock."""
    return get_purchases_by_stock_id(db_path, olimpia_kod)
