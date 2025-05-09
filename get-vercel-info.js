#!/usr/bin/env node

/**
 * This script helps you get your Vercel organization ID and project ID
 * Run this script with your Vercel token:
 * 
 * node get-vercel-info.js YOUR_VERCEL_TOKEN
 */

const https = require('https');

const token = process.argv[2];

if (!token) {
  console.error('Error: Vercel token is required');
  console.error('Usage: node get-vercel-info.js YOUR_VERCEL_TOKEN');
  console.error('\nTo get your Vercel token:');
  console.error('1. Go to https://vercel.com/account/tokens');
  console.error('2. Click "Create" to generate a new token');
  console.error('3. Copy the token and use it with this script');
  process.exit(1);
}

const options = {
  hostname: 'api.vercel.com',
  path: '/v2/user',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.error) {
        console.error('Error:', response.error.message);
        process.exit(1);
      }

      console.log('\n=== Vercel Account Information ===');
      console.log(`User ID: ${response.user.id}`);
      console.log(`Username: ${response.user.username}`);
      console.log(`Email: ${response.user.email}`);
      
      if (response.user.teamIds && response.user.teamIds.length > 0) {
        console.log('\n=== Team Information ===');
        
        const teamId = response.user.teamIds[0];
        console.log(`VERCEL_ORG_ID: ${teamId}`);
        
        const teamOptions = {
          hostname: 'api.vercel.com',
          path: `/v9/projects?teamId=${teamId}`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        
        const teamReq = https.request(teamOptions, (teamRes) => {
          let teamData = '';
          
          teamRes.on('data', (chunk) => {
            teamData += chunk;
          });
          
          teamRes.on('end', () => {
            try {
              const teamResponse = JSON.parse(teamData);
              
              if (teamResponse.error) {
                console.error('Error getting team projects:', teamResponse.error.message);
                return;
              }
              
              if (teamResponse.projects && teamResponse.projects.length > 0) {
                console.log('\n=== Team Projects ===');
                teamResponse.projects.forEach((project, index) => {
                  console.log(`${index + 1}. ${project.name}`);
                  console.log(`   VERCEL_PROJECT_ID: ${project.id}`);
                  console.log(`   URL: ${project.link}`);
                  console.log('');
                });
                
                console.log('\n=== GitHub Actions Configuration ===');
                console.log('Add these secrets to your GitHub repository:');
                console.log(`VERCEL_TOKEN=${token}`);
                console.log(`VERCEL_ORG_ID=${teamId}`);
                console.log(`VERCEL_PROJECT_ID=<select the appropriate project ID from above>`);
              } else {
                console.log('No projects found for this team.');
              }
            } catch (error) {
              console.error('Error parsing team response:', error.message);
            }
          });
        });
        
        teamReq.on('error', (error) => {
          console.error('Error getting team information:', error.message);
        });
        
        teamReq.end();
      } else {
        console.log('\n=== Personal Account Information ===');
        console.log(`VERCEL_ORG_ID: ${response.user.id}`);
        
        const projectsOptions = {
          hostname: 'api.vercel.com',
          path: '/v9/projects',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        
        const projectsReq = https.request(projectsOptions, (projectsRes) => {
          let projectsData = '';
          
          projectsRes.on('data', (chunk) => {
            projectsData += chunk;
          });
          
          projectsRes.on('end', () => {
            try {
              const projectsResponse = JSON.parse(projectsData);
              
              if (projectsResponse.error) {
                console.error('Error getting projects:', projectsResponse.error.message);
                return;
              }
              
              if (projectsResponse.projects && projectsResponse.projects.length > 0) {
                console.log('\n=== Your Projects ===');
                projectsResponse.projects.forEach((project, index) => {
                  console.log(`${index + 1}. ${project.name}`);
                  console.log(`   VERCEL_PROJECT_ID: ${project.id}`);
                  console.log(`   URL: ${project.link}`);
                  console.log('');
                });
                
                console.log('\n=== GitHub Actions Configuration ===');
                console.log('Add these secrets to your GitHub repository:');
                console.log(`VERCEL_TOKEN=${token}`);
                console.log(`VERCEL_ORG_ID=${response.user.id}`);
                console.log(`VERCEL_PROJECT_ID=<select the appropriate project ID from above>`);
              } else {
                console.log('No projects found.');
              }
            } catch (error) {
              console.error('Error parsing projects response:', error.message);
            }
          });
        });
        
        projectsReq.on('error', (error) => {
          console.error('Error getting projects:', error.message);
        });
        
        projectsReq.end();
      }
    } catch (error) {
      console.error('Error parsing response:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();

console.log('Fetching Vercel account information...');
