#!/usr/bin/env node

/**
 * This script updates the Vercel project protection settings to make the deployment public
 */

const https = require('https');

const token = 'OXWWVjnlWneESNMZ5psBefPi';
const projectId = 'prj_fTt5BA27RRp44Vi1ATSO73CRUPg2';
const teamId = 'UqbeR2NG79HTeS0zUSHxtzH7';

console.log('Getting current project settings...');

const getOptions = {
  hostname: 'api.vercel.com',
  path: `/v9/projects/${projectId}?teamId=${teamId}`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

const getReq = https.request(getOptions, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(responseData);
      console.log('Current project settings:', JSON.stringify(response, null, 2));
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('Successfully retrieved project settings!');
        
        updateProjectSettings(response);
      } else {
        console.error('Failed to get project settings:', response.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error parsing project settings response:', error.message);
    }
  });
});

getReq.on('error', (error) => {
  console.error('Error getting project settings:', error.message);
});

getReq.end();

function updateProjectSettings(currentSettings) {
  console.log('Updating project settings to disable protection...');
  
  const updateData = JSON.stringify({
    ssoProtection: {
      deploymentType: "none"
    }
  });
  
  const updateOptions = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${projectId}?teamId=${teamId}`,
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': updateData.length
    }
  };
  
  const updateReq = https.request(updateOptions, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        console.log('Update response:', JSON.stringify(response, null, 2));
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('Successfully updated project settings!');
          
          getLatestDeployments();
        } else {
          console.error('Failed to update project settings:', response.error || 'Unknown error');
        }
      } catch (error) {
        console.error('Error parsing update response:', error.message);
      }
    });
  });
  
  updateReq.on('error', (error) => {
    console.error('Error updating project settings:', error.message);
  });
  
  updateReq.write(updateData);
  updateReq.end();
}

function getLatestDeployments() {
  console.log('Getting latest deployments...');
  
  const deploymentsOptions = {
    hostname: 'api.vercel.com',
    path: `/v6/deployments?teamId=${teamId}&projectId=${projectId}&limit=5`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  const deploymentsReq = https.request(deploymentsOptions, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        
        if (res.statusCode >= 200 && res.statusCode < 300 && response.deployments) {
          console.log('Latest deployments:');
          
          response.deployments.forEach((deployment, index) => {
            console.log(`${index + 1}. URL: ${deployment.url}`);
            console.log(`   Created: ${new Date(deployment.created).toLocaleString()}`);
            console.log(`   State: ${deployment.state}`);
            console.log(`   Target: ${deployment.target || 'Not specified'}`);
            console.log('---');
          });
          
          if (response.deployments.length > 0) {
            updateDeploymentProtection(response.deployments[0].id);
          }
        } else {
          console.error('Failed to get deployments:', response.error || 'Unknown error');
        }
      } catch (error) {
        console.error('Error parsing deployments response:', error.message);
      }
    });
  });
  
  deploymentsReq.on('error', (error) => {
    console.error('Error getting deployments:', error.message);
  });
  
  deploymentsReq.end();
}

function updateDeploymentProtection(deploymentId) {
  console.log(`Updating protection for deployment ${deploymentId}...`);
  
  const updateData = JSON.stringify({
    protection: null
  });
  
  const updateOptions = {
    hostname: 'api.vercel.com',
    path: `/v13/deployments/${deploymentId}/protection?teamId=${teamId}`,
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': updateData.length
    }
  };
  
  const updateReq = https.request(updateOptions, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        if (responseData) {
          const response = JSON.parse(responseData);
          console.log('Deployment protection update response:', JSON.stringify(response, null, 2));
        } else {
          console.log('Deployment protection updated successfully!');
        }
      } catch (error) {
        console.error('Error parsing deployment protection update response:', error.message);
      }
    });
  });
  
  updateReq.on('error', (error) => {
    console.error('Error updating deployment protection:', error.message);
  });
  
  updateReq.write(updateData);
  updateReq.end();
}
