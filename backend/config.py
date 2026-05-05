import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    # Database — uses instance/site.db relative to this file
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'sqlite:///' + os.path.join(basedir, 'instance', 'site.db')
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.environ.get(
        'JWT_SECRET_KEY',
        '9b1df6b4d7f2c3b58d1b6398c0f47a9a7a3e8d2b4f6a1e3f'
    )

    # Secret key for Flask sessions
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
