output "media_bucket_name" { value = aws_s3_bucket.media.id }
output "media_bucket_arn" { value = aws_s3_bucket.media.arn }
output "cdn_domain" { value = aws_cloudfront_distribution.media.domain_name }
output "cdn_distribution_id" { value = aws_cloudfront_distribution.media.id }
output "cdn_hosted_zone_id" { value = aws_cloudfront_distribution.media.hosted_zone_id }
