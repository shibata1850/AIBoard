#!/usr/bin/env node

/**
 * This script updates Vercel project settings to make the deployment public
 */

const https = require('https');

const token = 'OXWWVjnlWneESNMZ5psBefPi';
const projectId = 'prj_fTt5BA27RRp44Vi1ATSO73CRUPg2';
const teamId = 'UqbeR2NG79HTeS0zUSHxtzH7';

const protectionData = JSON.stringify({
  protection: false
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

console.log('Updating project protection settings...');

const protectionReq = https.request(protectionOptions, (res) => {
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
        createNewDeployment();
      } else {
        console.error('Failed to update project settings:', response.error || 'Unknown error');
        createNewDeployment();
      }
    } catch (error) {
      console.error('Error parsing response:', error.message);
      createNewDeployment();
    }
  });
});

protectionReq.on('error', (error) => {
  console.error('Error updating project settings:', error.message);
  createNewDeployment();
});

protectionReq.write(protectionData);
protectionReq.end();

function createNewDeployment() {
  console.log('Creating a new public deployment...');
  
  const deployData = JSON.stringify({
    name: 'Public deployment',
    target: 'production',
    public: true
  });
  
  const deployOptions = {
    hostname: 'api.vercel.com',
    path: `/v13/deployments?teamId=${teamId}`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': deployData.length
    }
  };
  
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
          console.log('Deployment created successfully!');
          if (response.url) {
            console.log('Deployment URL:', response.url);
          }
        } else {
          console.error('Failed to create deployment:', response.error || 'Unknown error');
        }
      } catch (error) {
        console.error('Error parsing deployment response:', error.message);
      }
    });
  });
  
  deployReq.on('error', (error) => {
    console.error('Error creating deployment:', error.message);
  });
  
  deployReq.write(deployData);
  deployReq.end();
}
