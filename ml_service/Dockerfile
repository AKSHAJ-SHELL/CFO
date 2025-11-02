FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set Python path
ENV PYTHONPATH=/app

# Create directories for models and data
RUN mkdir -p /app/models /app/app/data/synthetic /app/app/training/logs

# Expose port
EXPOSE 8080

# Make start script executable
RUN chmod +x start.sh

# Run start script
CMD ["bash", "start.sh"]

