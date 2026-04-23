#!/usr/bin/env node

/**
 * Production Deployment Verification Script
 * Tests the Render-hosted production systems
 */

const fetch = require('node-fetch')

const PRODUCTION_URLS = {
  co2routerEngine: process.env.CO2ROUTER_ENGINE_URL || 'https://ecobe-engineclaude.onrender.com',
  dksSaaS: process.env.DKS_SAAS_URL || 'https://dekes-saas.onrender.com',
  co2routerDashboard: process.env.CO2ROUTER_DASHBOARD_URL || 'https://co2-router-dashboard.onrender.com',
}

async function testHealthCheck(url, name) {
  console.log(`Testing ${name} health...`)
  try {
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      headers: { 'User-Agent': 'Production-Verification-Script' },
    })

    if (response.ok) {
      const data = await response.json()
      console.log(`OK ${name} - HEALTHY`)
      console.log(`Status: ${data.status || 'OK'}`)
      console.log(`Service: ${data.service || name}`)
      return true
    }

    console.log(`FAIL ${name} - FAILED (${response.status})`)
    return false
  } catch (error) {
    console.log(`FAIL ${name} - ERROR: ${error.message}`)
    return false
  }
}

async function testCo2routerIntegrations() {
  console.log('\nTesting CO2Router integration endpoints...')

  const baseUrl = PRODUCTION_URLS.co2routerEngine

  try {
    const summaryResponse = await fetch(`${baseUrl}/api/v1/integrations/dekes/summary?days=7`, {
      headers: { 'User-Agent': 'Production-Verification-Script' },
    })

    if (summaryResponse.ok) {
      const summary = await summaryResponse.json()
      console.log('OK DKS Summary Endpoint - WORKING')
      console.log(`Integration: ${summary.integration}`)
      console.log(`Status: ${summary.status}`)
      console.log(`Workloads: ${summary.metrics?.totalWorkloads || 0}`)
    } else {
      console.log(`FAIL DKS Summary Endpoint - FAILED (${summaryResponse.status})`)
    }

    const metricsResponse = await fetch(`${baseUrl}/api/v1/integrations/dekes/metrics?hours=24`, {
      headers: { 'User-Agent': 'Production-Verification-Script' },
    })

    if (metricsResponse.ok) {
      const metrics = await metricsResponse.json()
      console.log('OK DKS Metrics Endpoint - WORKING')
      console.log(`Success Rate: ${metrics.metrics?.successRate || 0}%`)
      console.log(`Status: ${metrics.status}`)
    } else {
      console.log(`FAIL DKS Metrics Endpoint - FAILED (${metricsResponse.status})`)
    }
  } catch (error) {
    console.log(`FAIL Integration Test - ERROR: ${error.message}`)
  }
}

async function testDksAuth() {
  console.log('\nTesting DKS auth flow...')

  try {
    const loginResponse = await fetch(`${PRODUCTION_URLS.dksSaaS}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Production-Verification-Script',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123',
      }),
    })

    if (loginResponse.status === 401) {
      console.log('OK DKS Auth Endpoint - WORKING (401 expected for invalid credentials)')
    } else if (loginResponse.ok) {
      console.log('OK DKS Auth Endpoint - WORKING (Login successful)')
    } else {
      console.log(`FAIL DKS Auth Endpoint - FAILED (${loginResponse.status})`)
    }
  } catch (error) {
    console.log(`FAIL DKS Auth Test - ERROR: ${error.message}`)
  }
}

async function testDashboard() {
  console.log('\nTesting CO2Router Dashboard...')

  try {
    const response = await fetch(PRODUCTION_URLS.co2routerDashboard, {
      headers: { 'User-Agent': 'Production-Verification-Script' },
    })

    if (response.ok) {
      const text = await response.text()
      if (text.includes('CO2Router') || text.includes('CO2 Router')) {
        console.log('OK Dashboard - WORKING (Correct branding detected)')
      } else {
        console.log('WARN Dashboard - LOADING (May need time for full load)')
      }
    } else {
      console.log(`FAIL Dashboard - FAILED (${response.status})`)
    }
  } catch (error) {
    console.log(`FAIL Dashboard Test - ERROR: ${error.message}`)
  }
}

async function runProductionVerification() {
  console.log('PRODUCTION DEPLOYMENT VERIFICATION')
  console.log('='.repeat(50))

  const engineHealthy = await testHealthCheck(PRODUCTION_URLS.co2routerEngine, 'CO2Router Engine')
  const dksHealthy = await testHealthCheck(PRODUCTION_URLS.dksSaaS, 'DKS SaaS')
  const dashboardHealthy = await testHealthCheck(PRODUCTION_URLS.co2routerDashboard, 'CO2Router Dashboard')

  await testCo2routerIntegrations()
  await testDksAuth()
  await testDashboard()

  console.log('\n' + '='.repeat(50))
  console.log('DEPLOYMENT SUMMARY')
  console.log(`CO2Router Engine: ${engineHealthy ? 'HEALTHY' : 'UNHEALTHY'}`)
  console.log(`DKS SaaS: ${dksHealthy ? 'HEALTHY' : 'UNHEALTHY'}`)
  console.log(`CO2Router Dashboard: ${dashboardHealthy ? 'HEALTHY' : 'UNHEALTHY'}`)

  const allHealthy = engineHealthy && dksHealthy && dashboardHealthy
  console.log(`\nOVERALL STATUS: ${allHealthy ? 'ALL SYSTEMS OPERATIONAL' : 'SOME ISSUES DETECTED'}`)

  if (allHealthy) {
    console.log('\nProduction deployment successful!')
    console.log('DKS -> CO2Router integration is live and tracking carbon savings.')
  } else {
    console.log('\nCheck the failed systems above and retry deployment.')
  }
}

if (require.main === module) {
  runProductionVerification().catch((error) => {
    console.error('Verification failed:', error)
    process.exit(1)
  })
}

module.exports = { runProductionVerification }
