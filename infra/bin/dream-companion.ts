#!/usr/bin/env node
import 'source-map-support/register';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as cdk from 'aws-cdk-lib';
import { DreamCompanionStack } from '../lib/dream-companion-stack';

// Load .env from project root if it exists
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = new cdk.App();

new DreamCompanionStack(app, 'DreamCompanionStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID,
    region: process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1',
  },
  description: 'DreamCompanion: Corner Edition - Full Stack Infrastructure (Amplify, App Runner, Lambda, API Gateway)',
});

app.synth();
