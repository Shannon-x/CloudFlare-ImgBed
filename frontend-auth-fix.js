// 前端认证修复脚本
// 这个脚本需要替换前端的 fetchWithAuth.js 实现

// 存储认证信息
let credentials = null;

// 设置认证信息
export function setCredentials(username, password) {
    credentials = {
        username: username,
        password: password
    };
    // 将认证信息存储在 localStorage 中
    localStorage.setItem('adminCredentials', JSON.stringify(credentials));
}

// 获取认证信息
export function getCredentials() {
    if (!credentials) {
        const stored = localStorage.getItem('adminCredentials');
        if (stored) {
            credentials = JSON.parse(stored);
        }
    }
    return credentials;
}

// 清除认证信息
export function clearCredentials() {
    credentials = null;
    localStorage.removeItem('adminCredentials');
}

// 生成 Basic Auth Header
function createBasicAuthHeader(username, password) {
    const encoded = btoa(`${username}:${password}`);
    return `Basic ${encoded}`;
}

// 修复后的 fetchWithAuth 函数
export default async function fetchWithAuth(url, options = {}) {
    // 开发环境下添加 /api 前缀
    url = process.env.NODE_ENV === 'production' ? url : `/api${url}`;

    const creds = getCredentials();
    
    if (creds) {
        // 设置 Authorization 头
        const headers = {
            ...options.headers,
            'Authorization': createBasicAuthHeader(creds.username, creds.password)
        };
        
        options = {
            ...options,
            headers
        };
    }

    try {
        const response = await fetch(url, options);
        
        // 如果返回 401，清除认证信息并重定向到登录页
        if (response.status === 401) {
            clearCredentials();
            // 显示错误消息
            if (typeof ElMessage !== 'undefined') {
                ElMessage.error('认证失败，请重新登录');
            }
            // 重定向到登录页
            if (typeof router !== 'undefined') {
                router.push('/');
            } else {
                window.location.href = '/';
            }
            throw new Error('Unauthorized');
        }
        
        return response;
    } catch (error) {
        // 如果是网络错误或其他错误，也显示错误消息
        if (typeof ElMessage !== 'undefined') {
            ElMessage.error(`请求失败: ${error.message}`);
        }
        throw error;
    }
}

// 登录函数
export async function adminLogin(username, password) {
    try {
        // 临时设置认证信息进行测试
        const testResponse = await fetch('/api/manage/debug', {
            headers: {
                'Authorization': createBasicAuthHeader(username, password)
            }
        });
        
        if (testResponse.ok) {
            // 认证成功，保存认证信息
            setCredentials(username, password);
            return { success: true };
        } else {
            return { success: false, error: '用户名或密码错误' };
        }
    } catch (error) {
        return { success: false, error: `登录失败: ${error.message}` };
    }
}

// 检查认证状态
export async function checkAuthStatus() {
    const creds = getCredentials();
    if (!creds) {
        return { authenticated: false };
    }
    
    try {
        const response = await fetchWithAuth('/api/manage/debug');
        return { authenticated: response.ok };
    } catch (error) {
        return { authenticated: false };
    }
}

// 在控制台输出使用说明
console.log(`
=== 前端认证修复说明 ===

这个脚本提供了修复后的认证函数。使用方法：

1. 在浏览器控制台运行管理员登录：
   adminLogin('your_username', 'your_password').then(result => console.log(result))

2. 检查认证状态：
   checkAuthStatus().then(status => console.log(status))

3. 手动清除认证信息：
   clearCredentials()

如果您是开发者，请将此脚本的 fetchWithAuth 函数替换前端源码中的对应函数。
`); 