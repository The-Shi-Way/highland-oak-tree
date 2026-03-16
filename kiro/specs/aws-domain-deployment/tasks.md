# Implementation Plan: AWS Domain Deployment

## Overview

Incrementally build the DNS, TLS, and HTTPS routing infrastructure for thehighlandoaktree.org. Each task modifies Terraform HCL files and builds on the previous step, ending with CI/CD wiring and a final validation checkpoint.

## Tasks

- [x] 1. Create the DNS Terraform module
  - [x] 1.1 Create `infra/modules/dns/variables.tf` with inputs: `domain_name`, `environment`, `project`, `alb_dns_name`, `alb_zone_id`, `cdn_domain_name`, `cdn_hosted_zone_id`
    - All variables typed as `string`
    - _Requirements: 6.1_
  - [x] 1.2 Create `infra/modules/dns/main.tf` with Route 53 hosted zone, ACM certificate (domain + wildcard SAN), DNS validation records, and certificate validation waiter
    - All resources gated with `count = var.domain_name != "" ? 1 : 0`
    - ACM certificate uses `DNS` validation method
    - Use `for_each` on `aws_acm_certificate.main[0].domain_validation_options` for validation records
    - Include `aws_acm_certificate_validation` resource that depends on all validation records
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 6.3_
  - [x] 1.3 Add Route 53 alias records to `infra/modules/dns/main.tf`: A and AAAA for root domain → ALB, CNAME for www → root, A alias for media subdomain → CloudFront
    - All gated with same `count` conditional
    - _Requirements: 4.3, 5.1, 5.2, 5.3_
  - [x] 1.4 Create `infra/modules/dns/outputs.tf` with `certificate_arn`, `name_servers`, and `zone_id` outputs
    - Use conditional expressions to return empty values when `domain_name == ""`
    - _Requirements: 1.2, 6.4, 9.1_

- [x] 2. Checkpoint — Validate DNS module in isolation
  - Run `terraform validate` in the `infra/` directory to confirm the new module has no syntax errors. Ask the user if questions arise.

- [x] 3. Update the networking module for ALB listeners and target groups
  - [x] 3.1 Add `certificate_arn` variable to `infra/modules/networking/variables.tf`
    - _Requirements: 6.2_
  - [x] 3.2 Add target groups, HTTP listener (redirect), HTTPS listener, and `/api/*` routing rule to `infra/modules/networking/main.tf`
    - `aws_lb_target_group.server`: port 3001, protocol HTTP, health check `/api/health`, target type `ip`
    - `aws_lb_target_group.client`: port 3000, protocol HTTP, health check `/api/_health`, target type `ip`
    - `aws_lb_listener.http`: port 80, default action redirect to HTTPS 301
    - `aws_lb_listener.https`: port 443, conditional on `certificate_arn != ""`, SSL policy `ELBSecurityPolicy-TLS13-1-2-2021-06`, default forward to client target group
    - `aws_lb_listener_rule.api`: path pattern `/api/*`, forward to server target group
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [x] 3.3 Add `alb_zone_id`, `server_target_group_arn`, and `client_target_group_arn` outputs to `infra/modules/networking/outputs.tf`
    - _Requirements: 3.1, 3.2_

- [x] 4. Update the ECS module for load balancer registration and domain-aware env vars
  - [x] 4.1 Add `server_target_group_arn`, `client_target_group_arn`, and `domain_name` variables to `infra/modules/ecs/variables.tf`
    - _Requirements: 3.6, 7.1, 7.2_
  - [x] 4.2 Add `load_balancer` blocks to `aws_ecs_service.server` and `aws_ecs_service.client` in `infra/modules/ecs/main.tf`, conditional on target group ARN being non-empty
    - Use `dynamic "load_balancer"` block with `for_each` on a conditional list
    - _Requirements: 3.6_
  - [x] 4.3 Update `NUXT_PUBLIC_API_BASE` in client task definition and `CDN_BASE_URL` in server task definition to use domain-based URLs when `domain_name` is set
    - Client: `https://${var.domain_name}/api` when domain set, else current value
    - Server: `https://media.${var.domain_name}` when domain set, else current value
    - _Requirements: 7.1, 7.2_

- [x] 5. Update the storage module for CloudFront custom domain
  - [x] 5.1 Add `certificate_arn` and `media_subdomain` variables to `infra/modules/storage/variables.tf`
    - _Requirements: 4.1, 4.2_
  - [x] 5.2 Update `aws_cloudfront_distribution.media` in `infra/modules/storage/main.tf` to add `aliases` and ACM `viewer_certificate` when domain is configured
    - Use conditional: `aliases = var.media_subdomain != "" ? [var.media_subdomain] : []`
    - Update `viewer_certificate` block to use ACM cert with `sni-only` when `certificate_arn != ""`
    - _Requirements: 4.1, 4.2_
  - [x] 5.3 Add `cdn_hosted_zone_id` output to `infra/modules/storage/outputs.tf`
    - _Requirements: 4.3_

- [x] 6. Wire modules together in root configuration
  - [x] 6.1 Update `infra/main.tf` to declare the `dns` module with all required inputs from variables and other module outputs
    - Pass `alb_dns_name` and `alb_zone_id` from networking module
    - Pass `cdn_domain` and `cdn_hosted_zone_id` from storage module
    - _Requirements: 6.1_
  - [x] 6.2 Update `infra/main.tf` to pass `certificate_arn` from DNS module to networking and storage modules, pass target group ARNs from networking to ECS, and pass `domain_name` to ECS
    - _Requirements: 6.2_
  - [x] 6.3 Add `route53_name_servers` output to `infra/outputs.tf`
    - _Requirements: 6.4, 9.1_
  - [x] 6.4 Set `domain_name = "thehighlandoaktree.org"` in `infra/environments/production.tfvars`
    - _Requirements: 6.1_

- [x] 7. Checkpoint — Full Terraform validation
  - Run `terraform validate` and `terraform plan -var-file=environments/production.tfvars` to verify the complete configuration. Ensure all tests pass, ask the user if questions arise.

- [x] 8. Update CI/CD workflow
  - [x] 8.1 Add a Terraform apply step to `.github/workflows/deploy-production.yml` that runs before ECS service updates
    - Step should: checkout code, configure AWS credentials, run `terraform init`, run `terraform apply -auto-approve -var-file=environments/production.tfvars`
    - Place it after the approval gate and before Docker build steps
    - If this step fails, subsequent steps do not run (default GitHub Actions behavior)
    - _Requirements: 8.1, 8.2_

- [ ] 9. Write validation test script
  - [ ]* 9.1 Create `infra/tests/validate-dns-conditional.sh` — a shell script that runs `terraform plan -json` with `domain_name=""` and asserts zero DNS/ACM/Route53 resources in the plan
    - **Property 1: Empty domain disables all DNS resources**
    - **Validates: Requirements 6.3**
  - [ ]* 9.2 Create `infra/tests/validate-plan.sh` — a shell script that runs `terraform plan -json` with production tfvars and asserts expected resources exist (hosted zone, certificate, listeners, target groups, alias records)
    - Validates structural correctness of the full plan
    - _Requirements: 1.1, 2.1, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 5.1, 5.2, 5.3_

- [x] 10. Final checkpoint — Ensure all validations pass
  - Ensure `terraform validate` passes, plan output looks correct, and all test scripts pass. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All Terraform resources use conditional `count` so the feature is a no-op when `domain_name` is empty
- After `terraform apply`, the operator must update NS records at their domain registrar to point to the Route 53 name servers (output by the `route53_name_servers` output)
- ACM certificate validation will not complete until NS delegation is active — plan for a delay between initial apply and full functionality
- Property tests validate the conditional resource gating logic
