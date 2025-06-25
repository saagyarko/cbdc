# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the dependencies file to the working directory
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
# We use --no-cache-dir to reduce image size
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application's code to the working directory
COPY ./app /app/app

# Expose port 8000 to allow communication to the Uvicorn server
EXPOSE 8000

# Define the command to run your app using uvicorn
# This will be the entrypoint for your container
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 