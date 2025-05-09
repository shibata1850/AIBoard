#!/usr/bin/env node

/**
 * This script updates Vercel project settings to make the deployment public
 */

const https = require('https');

const token = 'OXWWVjnlWneESNMZ5psBefPi';
const projectId = 'prj_fTt5BA27RRp44Vi1ATSO73CRUPg2';
const orgId = 'UqbeR2NG79HTeS0zUSHxtzH7';

const data = JSON.stringify({
  framework: null,
  buildCommand: 'npm run build',
  outputDirectory: 'dist',
  installCommand: 'npm install --legacy-peer-deps',
  rootDirectory: null,
  directoryListing: false,
  nodeVersion: '18.x'
});

const options = {
  hostname: 'api.vercel.com',
  path: `/v9/projects/${projectId}`,
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Updating Vercel project settings...');

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(responseData);
      console.log('Response:', JSON.stringify(response, null, 2));
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('Project settings updated successfully!');
        console.log('Updating protection settings...');
        
        updateProtectionSettings();
      } else {
        console.error('Failed to update project settings:', response.error || 'Unknown error');
        updateProtectionSettings();
      }
    } catch (error) {
      console.error('Error parsing response:', error.message);
      updateProtectionSettings();
    }
  });
});

req.on('error', (error) => {
  console.error('Error updating project settings:', error.message);
});

req.write(data);
req.end();

function updateProtectionSettings() {
  const protectionData = JSON.stringify({
    protection: { enabled: false }
  });

  const protectionOptions = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${projectId}/protection`,
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': protectionData.length
    }
  };

  console.log('Updating protection settings...');

  const protectionReq = https.request(protectionOptions, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        console.log('Protection settings response:', JSON.stringify(response, null, 2));
        
        triggerDeployment();
      } catch (error) {
        console.error('Error parsing protection response:', error.message);
        triggerDeployment();
      }
    });
  });

  protectionReq.on('error', (error) => {
    console.error('Error updating protection settings:', error.message);
    triggerDeployment();
  });

  protectionReq.write(protectionData);
  protectionReq.end();
}

function triggerDeployment() {
  const deployData = JSON.stringify({
    target: 'production',
    name: 'Public deployment',
    gitSource: {
      type: 'github',
      ref: 'main-branch'
    }
  });
  
  const deployOptions = {
    hostname: 'api.vercel.com',
    path: `/v13/deployments?teamId=${orgId}`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': deployData.length
    }
  };
  
  console.log('Triggering new deployment...');
  
  const deployReq = https.request(deployOptions, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        console.log('Deployment response:', JSON.stringify(response, null, 2));
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('Deployment triggered successfully!');
          if (response.url) {
            console.log('Deployment URL:', response.url);
          }
        } else {
          console.error('Failed to trigger deployment:', response.error || 'Unknown error');
          console.log('Trying alternative deployment method...');
          createSimpleDeployment();
        }
      } catch (error) {
        console.error('Error parsing deployment response:', error.message);
        console.log('Trying alternative deployment method...');
        createSimpleDeployment();
      }
    });
  });
  
  deployReq.on('error', (error) => {
    console.error('Error triggering deployment:', error.message);
    console.log('Trying alternative deployment method...');
    createSimpleDeployment();
  });
  
  deployReq.write(deployData);
  deployReq.end();
}

function createSimpleDeployment() {
  const simpleDeployData = JSON.stringify({
    name: 'Simple public deployment',
    target: 'production',
    source: 'cli',
    projectSettings: {
      framework: null,
      buildCommand: 'npm run build',
      outputDirectory: 'dist',
      installCommand: 'npm install --legacy-peer-deps',
      rootDirectory: null
    }
  });
  
  const simpleDeployOptions = {
    hostname: 'api.vercel.com',
    path: `/v13/deployments?teamId=${orgId}`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': simpleDeployData.length
    }
  };
  
  const simpleDeployReq = https.request(simpleDeployOptions, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        console.log('Simple deployment response:', JSON.stringify(response, null, 2));
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('Simple deployment triggered successfully!');
          if (response.url) {
            console.log('Deployment URL:', response.url);
          }
        } else {
          console.error('Failed to trigger simple deployment:', response.error || 'Unknown error');
        }
      } catch (error) {
        console.error('Error parsing simple deployment response:', error.message);
      }
    });
  });
  
  simpleDeployReq.on('error', (error) => {
    console.error('Error triggering simple deployment:', error.message);
  });
  
  simpleDeployReq.write(simpleDeployData);
  simpleDeployReq.end();
}
