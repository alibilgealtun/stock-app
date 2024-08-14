from database.queries import add_sale

def add_new_sale(db_path, data):
    """Add a new sale."""
    add_sale(db_path, data)
