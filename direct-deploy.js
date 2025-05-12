#!/usr/bin/env node

/**
 * This script directly deploys the application to Vercel with protection disabled
 */

const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');

const token = 'OXWWVjnlWneESNMZ5psBefPi';
const projectId = 'prj_fTt5BA27RRp44Vi1ATSO73CRUPg2';
const orgId = 'UqbeR2NG79HTeS0zUSHxtzH7';

console.log('Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully.');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

console.log('Creating deployment payload...');
const deploymentData = JSON.stringify({
  name: 'Direct public deployment',
  target: 'production',
  public: true,
  projectSettings: {
    framework: null,
    buildCommand: null, // Skip build on Vercel since we already built locally
    outputDirectory: 'dist',
    installCommand: null, // Skip install on Vercel
    nodeVersion: '18.x',
    rootDirectory: null
  },
  ssoProtection: {
    deploymentType: 'none'
  }
});

const deploymentOptions = {
  hostname: 'api.vercel.com',
  path: `/v13/deployments?teamId=${orgId}`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': deploymentData.length
  }
};

console.log('Creating deployment...');
const deployReq = https.request(deploymentOptions, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(responseData);
      console.log('Deployment response:', JSON.stringify(response, null, 2));
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('Deployment created successfully!');
        if (response.url) {
          console.log('Deployment URL:', response.url);
        }
        
        updateProjectProtection();
      } else {
        console.error('Failed to create deployment:', response.error || 'Unknown error');
        console.log('Trying Vercel CLI deployment instead...');
        deployWithCLI();
      }
    } catch (error) {
      console.error('Error parsing deployment response:', error.message);
      console.log('Trying Vercel CLI deployment instead...');
      deployWithCLI();
    }
  });
});

deployReq.on('error', (error) => {
  console.error('Error creating deployment:', error.message);
  console.log('Trying Vercel CLI deployment instead...');
  deployWithCLI();
});

deployReq.write(deploymentData);
deployReq.end();

function updateProjectProtection() {
  console.log('Updating project protection settings...');
  
  const protectionData = JSON.stringify({
    ssoProtection: {
      deploymentType: 'none'
    }
  });
  
  const protectionOptions = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${projectId}`,
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': protectionData.length
    }
  };
  
  const protectionReq = https.request(protectionOptions, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        console.log('Protection settings response:', JSON.stringify(response, null, 2));
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('Protection settings updated successfully!');
        } else {
          console.error('Failed to update protection settings:', response.error || 'Unknown error');
        }
      } catch (error) {
        console.error('Error parsing protection response:', error.message);
      }
    });
  });
  
  protectionReq.on('error', (error) => {
    console.error('Error updating protection settings:', error.message);
  });
  
  protectionReq.write(protectionData);
  protectionReq.end();
}

function deployWithCLI() {
  console.log('Deploying with Vercel CLI...');
  try {
    execSync('npx vercel --token "$VERCEL_TOKEN" --prod --confirm', {
      stdio: 'inherit',
      env: {
        ...process.env,
        VERCEL_TOKEN: token
      }
    });
    console.log('CLI deployment completed successfully.');
  } catch (error) {
    console.error('CLI deployment failed:', error.message);
  }
}
