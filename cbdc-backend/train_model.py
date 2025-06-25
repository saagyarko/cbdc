import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import numpy as np
import os

def create_and_train_model():
    """
    Generates synthetic data, trains a simple neural network for fraud detection,
    and saves the model.
    """
    print("1. Generating synthetic transaction data...")
    # Create a more realistic synthetic dataset
    np.random.seed(42)
    num_samples = 10000
    data = {
        'amount': np.random.lognormal(mean=3, sigma=1, size=num_samples),
        'tx_per_hour': np.random.randint(1, 20, size=num_samples),
        'device_id_freq': np.random.randint(1, 5, size=num_samples),
        'is_foreign': np.random.randint(0, 2, size=num_samples),
    }
    df = pd.DataFrame(data)

    # Create a simple rule for fraud
    df['is_fraud'] = (
        (df['amount'] > 1000) & (df['tx_per_hour'] > 10) |
        (df['amount'] > 500) & (df['is_foreign'] == 1)
    ).astype(int)
    
    print(f"Generated {len(df)} samples, with {df['is_fraud'].sum()} fraud cases.")

    # Define features and target
    X = df.drop('is_fraud', axis=1)
    y = df['is_fraud']

    # Split and scale the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print("2. Building and training the TensorFlow model...")
    # Define the model
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(X_train_scaled.shape[1],)),
        tf.keras.layers.Dense(16, activation='relu'),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(8, activation='relu'),
        tf.keras.layers.Dense(1, activation='sigmoid')
    ])

    model.compile(optimizer='adam',
                  loss='binary_crossentropy',
                  metrics=['accuracy'])

    # Train the model
    model.fit(X_train_scaled, y_train, epochs=10, batch_size=32, validation_split=0.1, verbose=1)

    print("3. Evaluating the model...")
    loss, accuracy = model.evaluate(X_test_scaled, y_test)
    print(f"Test Accuracy: {accuracy:.4f}")

    print("4. Saving the model...")
    # Save the entire model to a directory
    model_dir = 'fraud_model'
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
    model.save(model_dir)
    print(f"Model saved successfully in the '{model_dir}' directory.")

if __name__ == "__main__":
    create_and_train_model() 