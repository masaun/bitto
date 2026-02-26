export async function GET(request: Request) {
  return new Response(JSON.stringify({ contract: 'magnet-grade-material-allocation', status: 'ok' }), { headers: { 'Content-Type': 'application/json' } });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    return new Response(JSON.stringify({ success: true, data }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}
