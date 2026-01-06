import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // No authentication required - allow all requests
    return NextResponse.next({ request })
}

