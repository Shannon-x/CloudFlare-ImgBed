// === CloudFlare ImgBed 前端认证修复脚本 ===
// 在浏览器控制台中运行此脚本来修复认证问题

(function() {
    'use strict';
    
    console.log('🔧 CloudFlare ImgBed 认证修复脚本启动...');
    
    // 修复后的认证函数
    window.fixedAdminLogin = async function(username, password) {
        try {
            const authHeader = 'Basic ' + btoa(username + ':' + password);
            
            // 测试认证
            const testResponse = await fetch('/api/manage/debug', {
                headers: {
                    'Authorization': authHeader
                }
            });
            
            if (testResponse.ok) {
                // 保存认证信息
                localStorage.setItem('adminAuth', authHeader);
                console.log('✅ 登录成功！认证信息已保存');
                return { success: true };
            } else {
                console.log('❌ 登录失败：用户名或密码错误');
                return { success: false, error: '用户名或密码错误' };
            }
        } catch (error) {
            console.log('❌ 登录失败：', error.message);
            return { success: false, error: error.message };
        }
    };
    
    // 修复所有 fetch 请求
    const originalFetch = window.fetch;
    window.fetch = async function(url, options = {}) {
        // 检查是否是管理API请求
        if (url.includes('/api/manage/') && !url.includes('/api/manage/debug')) {
            const authHeader = localStorage.getItem('adminAuth');
            if (authHeader) {
                options.headers = {
                    ...options.headers,
                    'Authorization': authHeader
                };
            }
        }
        
        const response = await originalFetch(url, options);
        
        // 如果返回401，清除认证信息
        if (response.status === 401 && url.includes('/api/manage/')) {
            localStorage.removeItem('adminAuth');
            console.log('🔄 认证已过期，请重新登录');
        }
        
        return response;
    };
    
    // 检查当前认证状态
    window.checkAuthStatus = async function() {
        const authHeader = localStorage.getItem('adminAuth');
        if (!authHeader) {
            console.log('❌ 未登录');
            return false;
        }
        
        try {
            const response = await originalFetch('/api/manage/debug', {
                headers: { 'Authorization': authHeader }
            });
            const isAuthenticated = response.ok;
            console.log(isAuthenticated ? '✅ 已认证' : '❌ 认证失败');
            return isAuthenticated;
        } catch (error) {
            console.log('❌ 认证检查失败：', error.message);
            return false;
        }
    };
    
    // 清除认证信息
    window.clearAuth = function() {
        localStorage.removeItem('adminAuth');
        console.log('🗑️ 认证信息已清除');
    };
    
    // 自动修复现有页面的请求
    function fixExistingRequests() {
        // 重写 XMLHttpRequest
        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            const originalOpen = xhr.open;
            
            xhr.open = function(method, url, ...args) {
                if (url.includes('/api/manage/') && !url.includes('/api/manage/debug')) {
                    const authHeader = localStorage.getItem('adminAuth');
                    if (authHeader) {
                        xhr.setRequestHeader('Authorization', authHeader);
                    }
                }
                return originalOpen.apply(this, [method, url, ...args]);
            };
            
            return xhr;
        };
    }
    
    fixExistingRequests();
    
    console.log(`
🚀 修复脚本已激活！使用方法：

1. 登录管理员账户：
   fixedAdminLogin('your_username', 'your_password')

2. 检查认证状态：
   checkAuthStatus()

3. 清除认证信息：
   clearAuth()

4. 修复完成后，请刷新页面并重新登录管理界面。

注意：请将 'your_username' 和 'your_password' 替换为您的实际管理员用户名和密码。
    `);
    
})();

// 提供简化的使用说明
console.log(`
🔧 快速修复步骤：

1. 首先运行登录命令（替换为您的实际用户名密码）：
   fixedAdminLogin('admin', 'your_password')

2. 登录成功后，刷新页面即可正常使用管理功能。
`); 