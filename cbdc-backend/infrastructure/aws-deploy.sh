#!/bin/bash
# cbdc-backend/infrastructure/aws-deploy.sh

# Create ECS cluster
aws ecs create-cluster --cluster-name fintrust-fabric

# Register task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definitions.json

# Create IAM role
aws iam create-role --role-name FintrustFabricRole --assume-role-policy-document file://trust-policy.json
aws iam attach-role-policy --role-name FintrustFabricRole --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerServiceFullAccess

# Launch service (example)
aws ecs create-service --cluster fintrust-fabric --service-name peer0-org1 --task-definition fabric-peer --desired-count 1