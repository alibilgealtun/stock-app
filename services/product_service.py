from database.queries import add_product

def add_new_product(db_path, data):
    """Add a new product."""
    add_product(db_path, data)
