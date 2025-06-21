export async function onRequest(context) {
    const { request, env } = context;
    
    // 获取所有请求头
    const headers = {};
    request.headers.forEach((value, key) => {
        headers[key] = value;
    });
    
    // 检查Authorization header
    const authHeader = request.headers.get('Authorization');
    
    // 检查环境变量
    const basicUser = env.BASIC_USER;
    const basicPass = env.BASIC_PASS;
    
    const debugInfo = {
        method: request.method,
        url: request.url,
        headers: headers,
        hasAuthHeader: !!authHeader,
        authHeaderType: authHeader ? authHeader.split(' ')[0] : null,
        basicUserSet: !!basicUser,
        basicPassSet: !!basicPass,
        kvBinding: typeof env.img_url !== "undefined",
        timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(debugInfo, null, 2), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
} 