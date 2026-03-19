import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateData } from '@/lib/generator'
import Ajv from 'ajv'

// Helper function to generate mock data
async function generateMockData(type: string, config: any, searchParams: URLSearchParams) {
  const count = parseInt(searchParams.get('count') || '1', 10)
  const seed = searchParams.has('seed') ? parseInt(searchParams.get('seed')!, 10) : undefined
  return generateData(type, config, count, seed)
}

async function handleMockRequest(request: NextRequest, params: { namespace: string, slug: string[] }) {
  try {
    const supabase = await createClient()
    const { namespace, slug } = await params
    const requestMethod = request.method.toUpperCase()

    // Convert array of slugs back to string path
    const path = slug.join('/')

    const searchParams = request.nextUrl.searchParams
    const delay = searchParams.has('delay') ? parseInt(searchParams.get('delay')!, 10) : 0
    const forceStatus = searchParams.get('status') || searchParams.get('error')
    if (forceStatus) {
      const status = parseInt(forceStatus, 10) || 500
      return NextResponse.json({ error: `Simulated status ${status}` }, { status })
    }

    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    // Safely consume payload body if provided (avoid fetch stream stall)
    let parsedBody: any = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(requestMethod)) {
      try {
        parsedBody = await request.json()
      } catch (e) {
        // Body was either empty or not valid JSON
        parsedBody = {}
      }
    }

    // Find endpoint by namespace and path
    // Also matching method if it's specified, or falling back to 'ALL' if the endpoint supports everything
    const { data: endpoint, error } = await supabase
      .from('endpoints')
      .select('*')
      .eq('namespace', namespace)
      .eq('path', path)
      .or(`method.eq.${requestMethod},method.eq.ALL`)
      .single()

    if (error || !endpoint) {
      return NextResponse.json({ error: `Mock endpoint /${namespace}/${path} not found.` }, { status: 404 })
    }

    // --- PAYLOAD VALIDATION LAYER ---
    if (endpoint.request_schema && ['POST', 'PUT', 'PATCH'].includes(requestMethod)) {
      try {
        const ajv = new Ajv({ allErrors: true })
        const validate = ajv.compile(endpoint.request_schema)
        const valid = validate(parsedBody)
        if (!valid) {
          return NextResponse.json({
            error: 'Bad Request - Payload Validation Failed',
            validation_errors: validate.errors
          }, { status: 400 })
        }
      } catch (vErr: any) {
        return NextResponse.json({ 
          error: 'Endpoint Request Schema is fundamentally malformed internally', 
          details: vErr.message 
        }, { status: 500 })
      }
    }
    // --------------------------------

    try {
      const data = await generateMockData(endpoint.type, endpoint.config, searchParams)

      return NextResponse.json(data, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'X-Powered-By': 'Simulyn Engine'
        }
      })
    } catch (err: any) {
      console.error('Mock engine error:', err)
      return NextResponse.json({ error: 'Internal server error while generating mock data', details: err.message }, { status: 500 })
    }
  } catch (err: any) {
    console.error('Request handling error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred', details: err.message }, { status: 500 })
  }
}

// Export standard HTTP methods all routing to the same handler
export const GET = (req: NextRequest, { params }: { params: Promise<{ namespace: string, slug: string[] }> }) => handleMockRequest(req, params as any)
export const POST = (req: NextRequest, { params }: { params: Promise<{ namespace: string, slug: string[] }> }) => handleMockRequest(req, params as any)
export const PUT = (req: NextRequest, { params }: { params: Promise<{ namespace: string, slug: string[] }> }) => handleMockRequest(req, params as any)
export const PATCH = (req: NextRequest, { params }: { params: Promise<{ namespace: string, slug: string[] }> }) => handleMockRequest(req, params as any)
export const DELETE = (req: NextRequest, { params }: { params: Promise<{ namespace: string, slug: string[] }> }) => handleMockRequest(req, params as any)
export const OPTIONS = () => new NextResponse(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS' } })
