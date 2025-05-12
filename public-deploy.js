#!/usr/bin/env node

/**
 * This script uses the Vercel API to update project settings and create a public deployment
 */

const https = require('https');
const { execSync } = require('child_process');

const token = 'OXWWVjnlWneESNMZ5psBefPi';
const projectId = 'prj_fTt5BA27RRp44Vi1ATSO73CRUPg2';
const teamId = 'UqbeR2NG79HTeS0zUSHxtzH7';

console.log('Updating project settings...');

const projectData = JSON.stringify({
  publicSource: true,
  commandForIgnoringBuildStep: 'echo "Skipping checks"',
  rootDirectory: null,
  framework: null,
  nodeVersion: '18.x',
  buildCommand: 'npm run build',
  outputDirectory: 'dist',
  installCommand: 'npm install --legacy-peer-deps'
});

const projectOptions = {
  hostname: 'api.vercel.com',
  path: `/v9/projects/${projectId}`,
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': projectData.length
  }
};

const projectReq = https.request(projectOptions, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(responseData);
      console.log('Project settings response:', JSON.stringify(response, null, 2));
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('Project settings updated successfully!');
        
        deployWithCLI();
      } else {
        console.error('Failed to update project settings:', response.error || 'Unknown error');
        deployWithCLI();
      }
    } catch (error) {
      console.error('Error parsing project settings response:', error.message);
      deployWithCLI();
    }
  });
});

projectReq.on('error', (error) => {
  console.error('Error updating project settings:', error.message);
  deployWithCLI();
});

projectReq.write(projectData);
projectReq.end();

function deployWithCLI() {
  console.log('Building application...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Build completed successfully.');
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }

  console.log('Deploying with Vercel CLI...');
  try {
    execSync('npx vercel --token "$VERCEL_TOKEN" --prod --yes --public', {
      stdio: 'inherit',
      env: {
        ...process.env,
        VERCEL_TOKEN: token
      }
    });
    console.log('CLI deployment completed successfully.');
    
    updateProjectProtection();
  } catch (error) {
    console.error('CLI deployment failed:', error.message);
    updateProjectProtection();
  }
}

function updateProjectProtection() {
  console.log('Updating project protection settings...');
  
  const protectionData = JSON.stringify({
    protection: null
  });
  
  const protectionOptions = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${projectId}/protection`,
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  const protectionReq = https.request(protectionOptions, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        if (responseData) {
          const response = JSON.parse(responseData);
          console.log('Protection settings response:', JSON.stringify(response, null, 2));
        } else {
          console.log('Protection settings removed successfully!');
        }
      } catch (error) {
        console.error('Error parsing protection response:', error.message);
      }
    });
  });
  
  protectionReq.on('error', (error) => {
    console.error('Error updating protection settings:', error.message);
  });
  
  protectionReq.end();
}
