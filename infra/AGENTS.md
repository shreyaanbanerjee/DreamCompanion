# AWS Infrastructure Agent Guidelines (`infra/`)

This directory contains the AWS CDK v2 TypeScript Infrastructure as Code definitions.

---

## 1. Concrete Commands

```bash
# Install infrastructure dependencies
npm install

# Synthesize CloudFormation template
npx cdk synth

# Check infrastructure diff against active AWS account
npx cdk diff

# Deploy stack to AWS (Requires human approval)
npx cdk deploy --require-approval never
```

---

## 2. Infrastructure Architecture (`DreamCompanionStack`)

- **AWS Lambda**: `dreamcompanion-ask-corner` (Python 3.11, 512 MB, 30s timeout).
- **AWS API Gateway**: HTTP API with CORS wildcard (`*`), routing `POST /ask`.
- **AWS App Runner**: `dreamcompanion-simulator` (1 vCPU, 2 GB RAM) pulling container asset from ECR.
- **AWS Amplify**: `dreamcompanion-corner-frontend` with SPA rewrite rules (`/index.html`).

---

## 3. Strict Security Protocols

- **Dynamic Environment Resolution**: Never hardcode AWS Account IDs (`251523...`) or regions into CDK files. Derive from `CDK_DEFAULT_ACCOUNT` or `AWS_ACCOUNT_ID`.
- **Zero Secret Commits**: API keys (`GEMINI_API_KEY`, `ANTHROPIC_API_KEY`) must only be passed into CloudFormation via environment variables at deployment time.

---

## 4. Boundaries & Permissions

- **Autonomous**: Running `npx cdk synth`, verifying TypeScript compilation with `tsc`, checking resource schemas.
- **Restricted**: Running `npx cdk deploy`, deleting CloudFormation stacks, or mutating AWS IAM access policies.

