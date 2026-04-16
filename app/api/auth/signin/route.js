export async function GET() { return new Response(JSON.stringify({ message: 'signin route active' }), { status: 200, headers: { 'Content-Type': 'application/json' } }); }
