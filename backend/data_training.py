import os
import pandas as pd
from sqlalchemy import create_engine
from sklearn.decomposition import NMF
from imblearn.over_sampling import SMOTE
from models import ShoeRecomendationForUsers, db
import joblib
import logging
import numpy as np
from sklearn.preprocessing import StandardScaler

# Menambahkan pengaturan logging untuk melacak progres dan error
logging.basicConfig(level=logging.DEBUG)


def train_nmf_model():
    """Train NMF recommendation model using user interaction data."""
    # Use portable path — database relative to this file
    basedir = os.path.abspath(os.path.dirname(__file__))
    database_path = os.path.join(basedir, 'instance', 'site.db')

    # Membuat koneksi ke database SQLite menggunakan SQLAlchemy
    engine = create_engine(f'sqlite:///{database_path}')

    try:
        # Membaca data interaksi pengguna dari tabel 'user_interaction' di database
        user_interactions = pd.read_sql_table('user_interaction', engine)
        logging.info(f'Data berhasil dibaca: {user_interactions.shape[0]} baris')
    except Exception as e:
        logging.error(f'Error saat membaca data: {e}')
        raise

    # Mengubah kolom 'interaction_type' menjadi bobot (implicit rating)
    # View (1), Wishlist (2), Cart (3), Order (4)
    user_interactions['interaction_type'] = user_interactions['interaction_type'].map({
        'view': 1, 'VIEW': 1,
        'wishlist': 2, 'WISHLIST': 2,
        'cart': 3, 'CART': 3,
        'order': 4, 'ORDER': 4,
    }).fillna(1)

    # Menangani missing values dan duplikat (ambil interaksi tertinggi)
    user_interactions = user_interactions.fillna(0)
    user_interactions = user_interactions.groupby(['id_user', 'shoe_detail_id'])['interaction_type'].max().reset_index()

    # Membuat matriks user-item
    user_item_matrix = pd.pivot_table(
        user_interactions,
        index='id_user',
        columns='shoe_detail_id',
        values='interaction_type',
        fill_value=0
    )
    logging.info(f'Matriks interaksi pengguna-sepatu berukuran: {user_item_matrix.shape}')

    # (SMOTE dihapus karena tidak valid secara matematis untuk digunakan pada Categorical ID seperti User ID dan Shoe ID)

    # Membuat model NMF
    nmf_model = NMF(n_components=min(20, min(user_item_matrix.shape)), init='random', random_state=42, solver='mu', max_iter=200)

    try:
        nmf_model.fit(user_item_matrix)
        logging.info("Model NMF berhasil dilatih.")
    except Exception as e:
        logging.error(f'Error saat melatih model NMF: {e}')
        raise

    # Transformasi matriks
    W = nmf_model.transform(user_item_matrix)
    H = nmf_model.components_

    # Menghitung prediksi interaksi
    predicted_interactions = np.dot(W, H)
    recommendation_df = pd.DataFrame(predicted_interactions, columns=user_item_matrix.columns)
    logging.info(f'Rekomendasi pertama: {recommendation_df.head()}')

    # Mengambil 10 sepatu teratas untuk setiap pengguna
    recommended_shoes = recommendation_df.apply(lambda row: row.nlargest(10).index.tolist(), axis=1)

    # Menyimpan hasil rekomendasi ke dalam database
    try:
        with db.session.begin():
            db.session.query(ShoeRecomendationForUsers).delete()
            for user_id, shoes in recommended_shoes.items():
                for shoe in shoes:
                    existing_recommendation = db.session.query(ShoeRecomendationForUsers).filter_by(
                        id_user=user_id, shoe_detail_id=shoe
                    ).first()
                    if not existing_recommendation:
                        new_recommendation = ShoeRecomendationForUsers(
                            id_user=user_id, shoe_detail_id=shoe
                        )
                        db.session.add(new_recommendation)
            db.session.commit()
            logging.info('Hasil rekomendasi berhasil disimpan ke database.')
    except Exception as e:
        logging.error(f'Error saat menyimpan hasil rekomendasi: {e}')
        raise

    # Menyimpan model NMF ke dalam file
    try:
        model_path = os.path.join(basedir, 'nmf_model.pkl')
        joblib.dump(nmf_model, model_path)
        logging.info("Model NMF berhasil disimpan!")
    except Exception as e:
        logging.error(f'Error saat menyimpan model NMF: {e}')
        raise
