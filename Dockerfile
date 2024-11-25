# Use the official Python base image
FROM python:latest

# Set the working directory in the container
WORKDIR /app

# Copy the requirements.txt to the container
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install pytest for testing
RUN pip install pytest

# Copy the rest of the application code to the container
COPY . .

# Expose the Flask app port (default is 5000)
EXPOSE 5000

# Define environment variable for Flask app
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

# Command to run the application
CMD ["flask", "run"]
