# Use the official AWS Lambda base image for Python 3.9
FROM public.ecr.aws/lambda/python:3.9

# Copy the trained model into the container
COPY ../fraud_model ./fraud_model

# Copy the Lambda function handler
COPY lambda_function.py ./

# Install project dependencies
# We only need tensorflow as numpy is a dependency of it
RUN pip install tensorflow

# Set the CMD to your handler.
# The format is <script_name>.<handler_function>
CMD [ "lambda_function.lambda_handler" ] 