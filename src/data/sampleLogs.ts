export const sampleLogs = {
  reactError: {
    title: "React Component Error",
    description: "Common React TypeError with null reference",
    content: `[2024-01-15 10:30:15] INFO Starting application...
[2024-01-15 10:30:16] DEBUG React development mode enabled
[2024-01-15 10:30:17] ERROR TypeError: Cannot read property 'map' of undefined
    at UserList.render (/src/components/UserList.tsx:45:23)
    at finishClassComponent (react-dom.js:1742:31)
    at updateClassComponent (react-dom.js:1692:24)
[2024-01-15 10:30:17] WARNING React Hook useEffect has a missing dependency: 'fetchUsers'
[2024-01-15 10:30:18] ERROR Failed to load resource: the server responded with a status of 404 (Not Found)
[2024-01-15 10:30:18] ERROR GET http://localhost:3000/api/users 404 (Not Found)
[2024-01-15 10:30:19] ERROR Uncaught (in promise) Error: Network request failed
    at fetchUsers (/src/utils/api.ts:12:15)
    at UserDashboard (/src/pages/Dashboard.tsx:28:9)`
  },

  networkError: {
    title: "Network & CORS Issues",
    description: "API failures and CORS blocking",
    content: `[2024-01-15 14:22:10] INFO Initializing API client...
[2024-01-15 14:22:11] ERROR Access to fetch at 'https://api.example.com/data' from origin 'http://localhost:3000' has been blocked by CORS policy
[2024-01-15 14:22:11] ERROR Failed to fetch
[2024-01-15 14:22:12] ERROR TypeError: Failed to fetch
    at APIClient.get (/src/lib/api-client.js:45:12)
    at async loadUserData (/src/hooks/useUser.js:23:18)
[2024-01-15 14:22:13] WARNING Retrying request in 2000ms...
[2024-01-15 14:22:15] ERROR Request timeout after 5000ms
[2024-01-15 14:22:15] ERROR NetworkError: A network error occurred.`
  },

  javascriptErrors: {
    title: "JavaScript Runtime Errors",
    description: "Various JS errors and undefined variables",
    content: `[2024-01-15 16:45:30] DEBUG Page loaded successfully
[2024-01-15 16:45:31] ERROR ReferenceError: calculateTotal is not defined
    at ShoppingCart.updateTotal (/src/components/Cart.js:67:5)
    at HTMLButtonElement.<anonymous> (/src/components/Cart.js:89:12)
[2024-01-15 16:45:32] ERROR TypeError: Cannot read property 'length' of null
    at validateForm (/src/utils/validation.js:15:23)
    at SubmitButton.handleClick (/src/components/Form.js:34:7)
[2024-01-15 16:45:33] ERROR SyntaxError: Unexpected token '}' in JSON at position 156
    at JSON.parse (<anonymous>)
    at parseResponse (/src/utils/api.js:28:18)
[2024-01-15 16:45:34] WARNING Performance warning: Component re-rendered 47 times
[2024-01-15 16:45:35] ERROR RangeError: Maximum call stack size exceeded
    at recursiveFunction (/src/utils/helpers.js:92:10)`
  }
}

export const getRandomSample = () => {
  const samples = Object.values(sampleLogs)
  return samples[Math.floor(Math.random() * samples.length)]
}