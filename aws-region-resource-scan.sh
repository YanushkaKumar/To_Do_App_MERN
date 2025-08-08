#!/bin/bash

echo "🔍 Scanning all AWS regions for ECS, EC2, Lambda, Load Balancer, and VPC resources..."

# Get all AWS regions
regions=$(aws ec2 describe-regions --query "Regions[*].RegionName" --output text)

for region in $regions; do
    echo "======================================"
    echo "🌍 Region: $region"

    echo "➡️  Checking ECS clusters..."
    ecs_clusters=$(aws ecs list-clusters --region "$region" --output text --query 'clusterArns')
    if [ -n "$ecs_clusters" ]; then
        echo "✅ ECS Clusters:"
        echo "$ecs_clusters"
    else
        echo "❌ No ECS clusters"
    fi

    echo "➡️  Checking EC2 instances..."
    ec2_instances=$(aws ec2 describe-instances --region "$region" --query "Reservations[*].Instances[*].InstanceId" --output text)
    if [ -n "$ec2_instances" ]; then
        echo "✅ EC2 Instances:"
        echo "$ec2_instances"
    else
        echo "❌ No EC2 instances"
    fi

    echo "➡️  Checking Lambda functions..."
    lambda_functions=$(aws lambda list-functions --region "$region" --query 'Functions[*].FunctionName' --output text)
    if [ -n "$lambda_functions" ]; then
        echo "✅ Lambda Functions:"
        echo "$lambda_functions"
    else
        echo "❌ No Lambda functions"
    fi

    echo "➡️  Checking Load Balancers..."
    load_balancers=$(aws elbv2 describe-load-balancers --region "$region" --query 'LoadBalancers[*].DNSName' --output text)
    if [ -n "$load_balancers" ]; then
        echo "✅ Load Balancers:"
        echo "$load_balancers"
    else
        echo "❌ No Load Balancers"
    fi

    echo "➡️  Checking VPCs..."
    vpcs=$(aws ec2 describe-vpcs --region "$region" --query 'Vpcs[*].VpcId' --output text)
    if [ -n "$vpcs" ]; then
        echo "✅ VPCs:"
        echo "$vpcs"
    else
        echo "❌ No VPCs"
    fi

    echo ""
done

echo "✅ Scan completed."
