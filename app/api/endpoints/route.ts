import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('endpoints')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { path, schema, template, method = 'GET', request_schema } = await request.json()

    if (!path || (!schema && !template)) {
      return NextResponse.json({ error: 'Path and either schema or template are required' }, { status: 400 })
    }

    const type = schema ? 'schema' : 'template'
    // The original code had a check for type, but the new logic ensures type is always 'schema' or 'template' if schema or template is present.
    // if (!type) return NextResponse.json({ error: 'Either schema or template is required' }, { status: 400 })

    // const config = schema || template // This is now directly in the insert object
    // const sanitizedPath = path.replace(/^\/+/, '').split('?')[0] // The new code uses 'path' directly
    const namespace = user.user_metadata?.namespace

    if (!namespace) return NextResponse.json({ error: 'User namespace not found' }, { status: 400 })

    const { data, error } = await supabase
      .from('endpoints')
      .insert({
        user_id: user.id,
        namespace: user.user_metadata?.namespace || user.email,
        path,
        type: schema ? 'schema' : 'template',
        config: schema || template,
        method: method.toUpperCase(),
        request_schema: request_schema || null
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Endpoint path exists for namespace' }, { status: 409 })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
