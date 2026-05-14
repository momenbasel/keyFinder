const SECRET_PATTERNS = [

  { name: "AWS Access Key ID", re: /\b(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}\b/g, severity: "critical", confidence: "high", provider: "AWS" },
  { name: "AWS Secret Access Key", re: /(?:aws_secret_access_key|aws_secret|secret_access_key|AWS_SECRET)\s*[:=]\s*['"]?([A-Za-z0-9/+=]{40})['"]?/gi, severity: "critical", confidence: "high", provider: "AWS" },
  { name: "AWS MWS Auth Token", re: /amzn\.mws\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, severity: "critical", confidence: "high", provider: "AWS" },
  { name: "AWS Cognito Pool ID", re: /(?:us|eu|ap|sa|ca|me|af)-(?:east|west|south|north|central|southeast|northeast)-[0-9]:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, severity: "medium", confidence: "high", provider: "AWS" },
  { name: "AWS AppSync GraphQL Key", re: /da2-[a-z0-9]{26}/g, severity: "high", confidence: "high", provider: "AWS" },
  { name: "AWS Session Token", re: /(?:aws_session_token|AWS_SESSION_TOKEN)\s*[:=]\s*['"]?([A-Za-z0-9/+=]{100,})['"]?/gi, severity: "critical", confidence: "high", provider: "AWS" },

  { name: "Google API Key", re: /\bAIza[0-9A-Za-z_-]{35}\b/g, severity: "high", confidence: "high", provider: "Google" },
  { name: "Google OAuth Access Token", re: /\bya29\.[0-9A-Za-z_-]+/g, severity: "critical", confidence: "high", provider: "Google" },
  { name: "Google OAuth Client ID", re: /[0-9]+-[a-z0-9_]{32}\.apps\.googleusercontent\.com/g, severity: "medium", confidence: "high", provider: "Google" },
  { name: "Google OAuth Client Secret", re: /(?:client_secret|google_secret)\s*[:=]\s*['"]?(GOCSPX-[A-Za-z0-9_-]{28})['"]?/gi, severity: "critical", confidence: "high", provider: "Google" },
  { name: "Google Cloud Service Account", re: /"type"\s*:\s*"service_account"/g, severity: "critical", confidence: "high", provider: "Google" },
  { name: "Firebase Database URL", re: /https:\/\/[a-z0-9-]+\.firebaseio\.com/g, severity: "medium", confidence: "high", provider: "Firebase" },
  { name: "Firebase Cloud Messaging Key", re: /\bAAAA[A-Za-z0-9_-]{7}:[A-Za-z0-9_-]{140}/g, severity: "high", confidence: "high", provider: "Firebase" },

  { name: "Azure Storage Account Key", re: /(?:AccountKey|azure_storage_key|AZURE_STORAGE_KEY)\s*[:=]\s*['"]?([A-Za-z0-9/+=]{88})['"]?/gi, severity: "critical", confidence: "high", provider: "Azure" },
  { name: "Azure Connection String", re: /DefaultEndpointsProtocol=https?;AccountName=[^;]+;AccountKey=[A-Za-z0-9/+=]{88}/g, severity: "critical", confidence: "high", provider: "Azure" },
  { name: "Azure SAS Token", re: /[?&]sig=[A-Za-z0-9%/+=]+&/g, severity: "high", confidence: "medium", provider: "Azure" },

  { name: "GitHub Personal Access Token", re: /\bghp_[A-Za-z0-9_]{36,}\b/g, severity: "critical", confidence: "high", provider: "GitHub" },
  { name: "GitHub OAuth Access Token", re: /\bgho_[A-Za-z0-9_]{36,}\b/g, severity: "critical", confidence: "high", provider: "GitHub" },
  { name: "GitHub User-to-Server Token", re: /\bghu_[A-Za-z0-9_]{36,}\b/g, severity: "critical", confidence: "high", provider: "GitHub" },
  { name: "GitHub Server-to-Server Token", re: /\bghs_[A-Za-z0-9_]{36,}\b/g, severity: "critical", confidence: "high", provider: "GitHub" },
  { name: "GitHub Refresh Token", re: /\bghr_[A-Za-z0-9_]{36,}\b/g, severity: "critical", confidence: "high", provider: "GitHub" },
  { name: "GitHub Fine-grained PAT", re: /\bgithub_pat_[A-Za-z0-9_]{22,}\b/g, severity: "critical", confidence: "high", provider: "GitHub" },

  { name: "GitLab Personal Access Token", re: /\bglpat-[A-Za-z0-9_-]{20,}\b/g, severity: "critical", confidence: "high", provider: "GitLab" },
  { name: "GitLab Pipeline Token", re: /\bglptt-[A-Za-z0-9_-]{20,}\b/g, severity: "high", confidence: "high", provider: "GitLab" },
  { name: "GitLab Runner Token", re: /\bGR1348941[A-Za-z0-9_-]{20}\b/g, severity: "high", confidence: "high", provider: "GitLab" },

  { name: "Stripe Secret Key", re: /\bsk_(live|test)_[0-9a-zA-Z]{24,}\b/g, severity: "critical", confidence: "high", provider: "Stripe" },
  { name: "Stripe Publishable Key", re: /\bpk_(live|test)_[0-9a-zA-Z]{24,}\b/g, severity: "low", confidence: "high", provider: "Stripe" },
  { name: "Stripe Restricted Key", re: /\brk_(live|test)_[0-9a-zA-Z]{24,}\b/g, severity: "critical", confidence: "high", provider: "Stripe" },
  { name: "Stripe Webhook Secret", re: /\bwhsec_[A-Za-z0-9]{32,}\b/g, severity: "high", confidence: "high", provider: "Stripe" },

  { name: "PayPal Braintree Access Token", re: /access_token\$production\$[0-9a-z]{16}\$[0-9a-f]{32}/g, severity: "critical", confidence: "high", provider: "PayPal" },

  { name: "Square Access Token", re: /\bsq0atp-[0-9A-Za-z_-]{22}\b/g, severity: "critical", confidence: "high", provider: "Square" },
  { name: "Square OAuth Secret", re: /\bsq0csp-[0-9A-Za-z_-]{43}\b/g, severity: "critical", confidence: "high", provider: "Square" },

  { name: "Slack Bot Token", re: /\bxoxb-[0-9]{10,}-[0-9]{10,}-[A-Za-z0-9]{24,}\b/g, severity: "critical", confidence: "high", provider: "Slack" },
  { name: "Slack User Token", re: /\bxoxp-[0-9]{10,}-[0-9]{10,}-[A-Za-z0-9]{24,}\b/g, severity: "critical", confidence: "high", provider: "Slack" },
  { name: "Slack App Token", re: /\bxapp-[0-9]+-[A-Za-z0-9]+-[0-9]+-[A-Za-z0-9]+/g, severity: "high", confidence: "high", provider: "Slack" },
  { name: "Slack Webhook URL", re: /hooks\.slack\.com\/services\/T[A-Z0-9]{8,}\/B[A-Z0-9]{8,}\/[A-Za-z0-9]{24}/g, severity: "high", confidence: "high", provider: "Slack" },

  { name: "Discord Bot Token", re: /[MN][A-Za-z\d]{23,}\.[\w-]{6}\.[\w-]{27,}/g, severity: "critical", confidence: "high", provider: "Discord" },
  { name: "Discord Webhook URL", re: /discord(?:app)?\.com\/api\/webhooks\/[0-9]+\/[A-Za-z0-9_-]+/g, severity: "high", confidence: "high", provider: "Discord" },

  { name: "Telegram Bot Token", re: /\b[0-9]{8,10}:[A-Za-z0-9_-]{35}\b/g, severity: "critical", confidence: "high", provider: "Telegram" },

  { name: "Twilio Account SID", re: /\bAC[0-9a-fA-F]{32}\b/g, severity: "medium", confidence: "high", provider: "Twilio" },
  { name: "Twilio API Key", re: /\bSK[0-9a-fA-F]{32}\b/g, severity: "high", confidence: "high", provider: "Twilio" },

  { name: "SendGrid API Key", re: /\bSG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}\b/g, severity: "critical", confidence: "high", provider: "SendGrid" },

  { name: "Mailchimp API Key", re: /\b[0-9a-f]{32}-us[0-9]{1,2}\b/g, severity: "high", confidence: "high", provider: "Mailchimp" },

  { name: "Mailgun API Key", re: /\bkey-[0-9a-zA-Z]{32}\b/g, severity: "high", confidence: "high", provider: "Mailgun" },

  { name: "NPM Access Token", re: /\bnpm_[A-Za-z0-9]{36}\b/g, severity: "critical", confidence: "high", provider: "NPM" },

  { name: "Docker Hub Token", re: /\bdckr_pat_[A-Za-z0-9_-]{27}\b/g, severity: "high", confidence: "high", provider: "Docker" },

  { name: "Vault Token", re: /\b(?:hvs|hvb|hvr)\.[A-Za-z0-9_-]{24,}\b/g, severity: "critical", confidence: "high", provider: "HashiCorp" },
  { name: "Terraform Cloud Token", re: /\b[A-Za-z0-9]{14}\.atlasv1\.[A-Za-z0-9_-]{60,}\b/g, severity: "critical", confidence: "high", provider: "HashiCorp" },

  { name: "MongoDB Connection String", re: /mongodb(?:\+srv)?:\/\/[^\s'"<>]+/g, severity: "critical", confidence: "high", provider: "MongoDB" },
  { name: "PostgreSQL Connection String", re: /postgres(?:ql)?:\/\/[^\s'"<>]+/g, severity: "critical", confidence: "high", provider: "PostgreSQL" },
  { name: "MySQL Connection String", re: /mysql:\/\/[^\s'"<>]+/g, severity: "critical", confidence: "high", provider: "MySQL" },
  { name: "Redis Connection String", re: /redis(?:s)?:\/\/[^\s'"<>]+/g, severity: "critical", confidence: "high", provider: "Redis" },

  { name: "Shopify Access Token", re: /\bshpat_[a-fA-F0-9]{32}\b/g, severity: "critical", confidence: "high", provider: "Shopify" },
  { name: "Shopify Custom App Token", re: /\bshpca_[a-fA-F0-9]{32}\b/g, severity: "critical", confidence: "high", provider: "Shopify" },
  { name: "Shopify Private App Token", re: /\bshppa_[a-fA-F0-9]{32}\b/g, severity: "critical", confidence: "high", provider: "Shopify" },
  { name: "Shopify Shared Secret", re: /\bshpss_[a-fA-F0-9]{32}\b/g, severity: "critical", confidence: "high", provider: "Shopify" },

  { name: "Sentry DSN", re: /https:\/\/[0-9a-f]{32}@(?:o[0-9]+\.)?(?:sentry\.io|[a-z0-9.-]+)\/[0-9]+/g, severity: "low", confidence: "high", provider: "Sentry" },
  { name: "Sentry Auth Token", re: /\bsntrys_[A-Za-z0-9_]{64,}\b/g, severity: "high", confidence: "high", provider: "Sentry" },

  { name: "New Relic API Key", re: /\bNRAK-[A-Z0-9]{27}\b/g, severity: "high", confidence: "high", provider: "New Relic" },
  { name: "New Relic Browser Key", re: /\bNRJS-[a-f0-9]{19}\b/g, severity: "medium", confidence: "high", provider: "New Relic" },

  { name: "PlanetScale Token", re: /\bpscale_tkn_[A-Za-z0-9_-]{43}\b/g, severity: "critical", confidence: "high", provider: "PlanetScale" },
  { name: "PlanetScale Password", re: /\bpscale_pw_[A-Za-z0-9_-]{43}\b/g, severity: "critical", confidence: "high", provider: "PlanetScale" },

  { name: "Linear API Key", re: /\blin_api_[A-Za-z0-9]{40}\b/g, severity: "high", confidence: "high", provider: "Linear" },

  { name: "Notion Integration Token", re: /\bntn_[A-Za-z0-9]{40,}\b/g, severity: "high", confidence: "high", provider: "Notion" },
  { name: "Notion Secret", re: /\bsecret_[A-Za-z0-9]{43}\b/g, severity: "high", confidence: "medium", provider: "Notion" },

  { name: "OpenAI API Key", re: /\bsk-[A-Za-z0-9]{20}T3BlbkFJ[A-Za-z0-9]{20}\b/g, severity: "critical", confidence: "high", provider: "OpenAI" },
  { name: "OpenAI API Key (Project)", re: /\bsk-proj-[A-Za-z0-9_-]{40,}\b/g, severity: "critical", confidence: "high", provider: "OpenAI" },
  { name: "Anthropic API Key", re: /\bsk-ant-[A-Za-z0-9_-]{90,}\b/g, severity: "critical", confidence: "high", provider: "Anthropic" },
  { name: "HuggingFace Token", re: /\bhf_[A-Za-z0-9]{34}\b/g, severity: "high", confidence: "high", provider: "HuggingFace" },
  { name: "Replicate API Token", re: /\br8_[A-Za-z0-9]{36}\b/g, severity: "high", confidence: "high", provider: "Replicate" },

  { name: "Twitter Bearer Token", re: /\bAAAAAAAAAAAAAAAAAAAAA[A-Za-z0-9%]+/g, severity: "critical", confidence: "high", provider: "Twitter" },
  { name: "Facebook Access Token", re: /\bEAAC[a-zA-Z0-9]+/g, severity: "critical", confidence: "high", provider: "Facebook" },
  { name: "Instagram Access Token", re: /\bIGQV[A-Za-z0-9_-]+/g, severity: "high", confidence: "high", provider: "Instagram" },

  { name: "Cloudflare API Token", re: /(?:cloudflare_api_token|CF_API_TOKEN|CLOUDFLARE_API_TOKEN)\s*[:=]\s*['"]?([A-Za-z0-9_-]{40})['"]?/gi, severity: "high", confidence: "medium", provider: "Cloudflare" },
  { name: "DigitalOcean Token", re: /\bdop_v1_[a-f0-9]{64}\b/g, severity: "critical", confidence: "high", provider: "DigitalOcean" },
  { name: "DigitalOcean Spaces Key", re: /\bDO00[A-Z0-9]{36}\b/g, severity: "high", confidence: "high", provider: "DigitalOcean" },
  { name: "Doppler Token", re: /\bdp\.(?:ct|st|sa|scim)\.[A-Za-z0-9_-]{40,}\b/g, severity: "critical", confidence: "high", provider: "Doppler" },
  { name: "Pulumi Access Token", re: /\bpul-[a-f0-9]{40}\b/g, severity: "high", confidence: "high", provider: "Pulumi" },
  { name: "Grafana API Key", re: /\bglc_[A-Za-z0-9_+/]{32,}\b/g, severity: "high", confidence: "high", provider: "Grafana" },
  { name: "Grafana Service Account Token", re: /\bglsa_[A-Za-z0-9_]{32,}_[0-9a-f]{8}\b/g, severity: "high", confidence: "high", provider: "Grafana" },

  { name: "Mapbox Public Token", re: /\bpk\.[A-Za-z0-9_-]{60,}\.[A-Za-z0-9_-]{20,}\b/g, severity: "medium", confidence: "high", provider: "Mapbox" },
  { name: "Mapbox Secret Token", re: /\bsk\.[A-Za-z0-9_-]{60,}\.[A-Za-z0-9_-]{20,}\b/g, severity: "high", confidence: "high", provider: "Mapbox" },

  { name: "Datadog API Key", re: /(?:datadog_api_key|DD_API_KEY|DATADOG_API_KEY)\s*[:=]\s*['"]?([0-9a-f]{32})['"]?/gi, severity: "high", confidence: "high", provider: "Datadog" },

  { name: "Algolia API Key", re: /(?:algolia_api_key|ALGOLIA_API_KEY|algolia_admin_key)\s*[:=]\s*['"]?([A-Za-z0-9]{32})['"]?/gi, severity: "high", confidence: "medium", provider: "Algolia" },

  { name: "Vercel Access Token", re: /(?:vercel_token|VERCEL_TOKEN)\s*[:=]\s*['"]?([A-Za-z0-9]{24})['"]?/gi, severity: "high", confidence: "medium", provider: "Vercel" },

  { name: "JSON Web Token", re: /\beyJhbGci[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, severity: "high", confidence: "high", provider: "JWT" },

  { name: "RSA Private Key", re: /-----BEGIN RSA PRIVATE KEY-----/g, severity: "critical", confidence: "high", provider: "Crypto" },
  { name: "EC Private Key", re: /-----BEGIN EC PRIVATE KEY-----/g, severity: "critical", confidence: "high", provider: "Crypto" },
  { name: "OpenSSH Private Key", re: /-----BEGIN OPENSSH PRIVATE KEY-----/g, severity: "critical", confidence: "high", provider: "Crypto" },
  { name: "PGP Private Key Block", re: /-----BEGIN PGP PRIVATE KEY BLOCK-----/g, severity: "critical", confidence: "high", provider: "Crypto" },

  { name: "Authorization Bearer Token", re: /(?:Authorization|Bearer)\s*[:=]\s*['"]?Bearer\s+([A-Za-z0-9_.\-/+=]{20,})['"]?/gi, severity: "high", confidence: "medium", provider: "Generic" },
  { name: "Basic Auth Credentials", re: /(?:Authorization)\s*[:=]\s*['"]?Basic\s+([A-Za-z0-9+/=]{10,})['"]?/gi, severity: "high", confidence: "medium", provider: "Generic" },
  { name: "Generic API Key", re: /(?:api[_-]?key|apiKey|API_KEY)\s*[:=]\s*['"`]([A-Za-z0-9_\-/.]{16,120})['"`]/gi, severity: "medium", confidence: "medium", provider: "Generic" },
  { name: "Generic Secret", re: /(?:secret[_-]?key|secretKey|SECRET_KEY|app[_-]?secret|APP_SECRET)\s*[:=]\s*['"`]([A-Za-z0-9_\-/.]{16,120})['"`]/gi, severity: "high", confidence: "medium", provider: "Generic" },
  { name: "Generic Token", re: /(?:access[_-]?token|auth[_-]?token|AUTH_TOKEN|ACCESS_TOKEN)\s*[:=]\s*['"`]([A-Za-z0-9_\-/.]{16,120})['"`]/gi, severity: "high", confidence: "medium", provider: "Generic" },
  { name: "Generic Password", re: /(?:password|passwd|PASSWD|PASSWORD)\s*[:=]\s*['"`]([^\s'"`]{8,120})['"`]/gi, severity: "high", confidence: "low", provider: "Generic" },
  { name: "Credential URL", re: /(?:https?|ftp):\/\/[^\s:@'"]+:[^\s:@'"]+@[^\s'"]+/g, severity: "high", confidence: "medium", provider: "Generic" },
];
