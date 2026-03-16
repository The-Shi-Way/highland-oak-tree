# Requirements Document

## Introduction

This feature configures DNS, SSL/TLS, and HTTPS routing for The Highland Oak Tree site so it is accessible at `thehighlandoaktree.org` with full TLS termination. The scope covers Route 53 hosted zone creation, ACM certificate provisioning with DNS validation, ALB HTTPS listener with path-based routing to ECS services, HTTP-to-HTTPS redirect, CloudFront custom domain for the media CDN, and corresponding Route 53 alias records. It also covers any CI/CD workflow updates needed to apply the new Terraform infrastructure.

## Glossary

- **ALB**: Application Load Balancer — the existing AWS load balancer in the networking module that fronts the ECS services
- **ACM**: AWS Certificate Manager — the service used to provision and manage TLS certificates
- **Route_53**: AWS Route 53 — the managed DNS service where the hosted zone and records are created
- **CloudFront_Distribution**: The existing AWS CloudFront CDN distribution serving media assets from S3
- **ECS_Server_Service**: The Fargate service running the NestJS backend on port 3001
- **ECS_Client_Service**: The Fargate service running the Nuxt 3 frontend on port 3000
- **DNS_Module**: A new Terraform module (`infra/modules/dns/`) responsible for Route 53, ACM, and DNS record resources
- **Networking_Module**: The existing Terraform module (`infra/modules/networking/`) containing VPC, subnets, and ALB resources
- **Storage_Module**: The existing Terraform module (`infra/modules/storage/`) containing S3 and CloudFront resources
- **Deploy_Workflow**: The GitHub Actions production deployment workflow (`.github/workflows/deploy-production.yml`)

## Requirements

### Requirement 1: Route 53 Hosted Zone

**User Story:** As a site operator, I want a Route 53 hosted zone for thehighlandoaktree.org, so that AWS manages DNS for the domain.

#### Acceptance Criteria

1. WHEN the Terraform DNS module is applied, THE DNS_Module SHALL create a Route 53 public hosted zone for the domain `thehighlandoaktree.org`
2. THE DNS_Module SHALL output the hosted zone ID and the list of name server records for NS delegation
3. WHEN the hosted zone is created, THE DNS_Module SHALL tag the hosted zone with the standard project and environment tags

### Requirement 2: ACM TLS Certificate

**User Story:** As a site operator, I want a TLS certificate covering thehighlandoaktree.org and *.thehighlandoaktree.org, so that all traffic is encrypted.

#### Acceptance Criteria

1. WHEN the Terraform DNS module is applied, THE DNS_Module SHALL request an ACM certificate for `thehighlandoaktree.org` with a Subject Alternative Name of `*.thehighlandoaktree.org`
2. THE DNS_Module SHALL create Route 53 DNS validation records for the ACM certificate within the hosted zone
3. WHEN DNS validation records are created, THE DNS_Module SHALL wait for the ACM certificate to reach `ISSUED` status before other resources reference the certificate ARN
4. THE ACM certificate SHALL be provisioned in the `us-east-1` region so it is usable by both ALB and CloudFront

### Requirement 3: ALB HTTPS Listener and Routing

**User Story:** As a site visitor, I want to reach the site over HTTPS with correct routing, so that API requests go to the backend and page requests go to the frontend.

#### Acceptance Criteria

1. WHEN the Terraform networking and ECS modules are updated, THE Networking_Module SHALL create an ALB target group for the ECS_Server_Service on port 3001 with health check path `/api/health`
2. WHEN the Terraform networking and ECS modules are updated, THE Networking_Module SHALL create an ALB target group for the ECS_Client_Service on port 3000 with health check path `/api/_health`
3. THE Networking_Module SHALL create an HTTPS (port 443) listener on the ALB that uses the ACM certificate ARN and defaults to forwarding traffic to the client target group
4. THE Networking_Module SHALL create a listener rule on the HTTPS listener that forwards requests matching path pattern `/api/*` to the server target group
5. THE Networking_Module SHALL modify the existing HTTP (port 80) listener to return a 301 redirect to HTTPS for all requests
6. WHEN the ECS services are updated, THE ECS_Server_Service and ECS_Client_Service SHALL register with their respective ALB target groups via `load_balancer` blocks in the ECS service definitions

### Requirement 4: CloudFront Custom Domain for Media CDN

**User Story:** As a site operator, I want the media CDN accessible at media.thehighlandoaktree.org, so that assets are served from a branded subdomain.

#### Acceptance Criteria

1. WHEN the domain name variable is set, THE Storage_Module SHALL configure the CloudFront_Distribution with the alias `media.thehighlandoaktree.org`
2. THE Storage_Module SHALL attach the ACM certificate to the CloudFront_Distribution viewer certificate configuration with `ssl_support_method` set to `sni-only`
3. THE DNS_Module SHALL create a Route 53 A alias record for `media.thehighlandoaktree.org` pointing to the CloudFront_Distribution

### Requirement 5: Route 53 DNS Records for ALB

**User Story:** As a site visitor, I want to access the site at thehighlandoaktree.org and www.thehighlandoaktree.org, so that the domain resolves to the load balancer.

#### Acceptance Criteria

1. THE DNS_Module SHALL create a Route 53 A alias record for `thehighlandoaktree.org` pointing to the ALB
2. THE DNS_Module SHALL create a Route 53 AAAA alias record for `thehighlandoaktree.org` pointing to the ALB
3. THE DNS_Module SHALL create a Route 53 CNAME record for `www.thehighlandoaktree.org` pointing to `thehighlandoaktree.org`

### Requirement 6: Terraform Module Wiring and Variables

**User Story:** As a developer, I want the new DNS module integrated into the root Terraform configuration, so that a single `terraform apply` provisions all resources.

#### Acceptance Criteria

1. THE root Terraform configuration SHALL declare the DNS module and pass the domain name, ALB DNS name, ALB hosted zone ID, CloudFront domain name, and CloudFront hosted zone ID as inputs
2. THE root Terraform configuration SHALL pass the ACM certificate ARN from the DNS module to the networking module and storage module
3. WHEN the `domain_name` variable is empty, THE DNS_Module SHALL skip creation of all DNS and certificate resources using conditional logic (count or for_each)
4. THE root Terraform configuration SHALL output the Route 53 name servers so the operator can configure NS delegation at the domain registrar

### Requirement 7: ECS Service Environment Update

**User Story:** As a developer, I want the ECS task definitions to reference the custom domain, so that the application generates correct URLs.

#### Acceptance Criteria

1. WHEN the domain name is configured, THE ECS_Client_Service task definition SHALL set `NUXT_PUBLIC_API_BASE` to `https://thehighlandoaktree.org/api`
2. WHEN the domain name is configured, THE ECS_Server_Service task definition SHALL include a `CDN_BASE_URL` environment variable set to `https://media.thehighlandoaktree.org`

### Requirement 8: CI/CD Workflow Update

**User Story:** As a developer, I want the production deploy workflow to document the Terraform apply step, so that infrastructure changes are applied alongside application deployments.

#### Acceptance Criteria

1. THE Deploy_Workflow SHALL include a step or documented comment explaining how to run `terraform apply` for infrastructure changes before ECS service updates
2. IF the Terraform apply step fails, THEN THE Deploy_Workflow SHALL halt the pipeline and prevent ECS service updates from proceeding

### Requirement 9: NS Delegation Documentation

**User Story:** As a site operator, I want clear instructions for pointing my domain registrar's nameservers to Route 53, so that DNS resolution works end-to-end.

#### Acceptance Criteria

1. THE DNS_Module SHALL include an output block that displays the four Route 53 name server values after apply
2. THE spec documentation SHALL include a manual step checklist for updating nameservers at the domain registrar
