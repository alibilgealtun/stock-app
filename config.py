import os

class Config:
    DB_PATH = os.path.join(os.path.dirname(__file__), 'olimpia.db')

config = Config()
