from database.queries import get_all_colors, add_color

def get_colors(db_path):
    """Get all colors."""
    return get_all_colors(db_path)

def add_new_color(db_path, new_color):
    """Add a new color."""
    add_color(db_path, new_color)
