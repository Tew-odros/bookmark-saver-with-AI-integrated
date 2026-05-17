FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and dataset
COPY dataset.json train.py app.py ./

# Run the training script during the build process to generate the .pkl files
RUN python train.py

EXPOSE 5000

# Use Gunicorn for production
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
