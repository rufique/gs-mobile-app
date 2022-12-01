const apiEndpoint = process.env.NODE_ENV === 'development' 
    ? 'http://172.18.190.208/shedApp/api/v1/' 
    : 'http://172.16.0.56:4400/gradingshed/api/v1/';

const setHeaders = (token = null, contentType = null) => {
    let headers = { 
        Accept: '*/*',
        Connection: "keep-alive"
    };
    if(contentType) headers["Content-Type"] = contentType;
    if(token) headers.Authorization = `Bearer ${token}`;
    return headers;
}

const Api = {
    get: async(endpoint, token = null) => {
        try {
            let response = await fetch(`${apiEndpoint}${endpoint}`, {
                method: "GET",
                headers: setHeaders(token, 'application/json')
            });
            return handleResponse(response)
        } catch (e) {
            return handleError(e);
        }
    },
    post: async(endpoint, data, token) => {
        try {
            let response = await fetch(`${apiEndpoint}${endpoint}`, {
                method: 'POST',
                headers: setHeaders(token),
                body: data
            });
            return handleResponse(response)
        } catch (e) {
            return handleError(e);
        }
    },
}

export async function handleResponse (response) {
    const json = response.json();
    const error = await json;
    if(response.ok) return json;    
    if(response.status === 400) {
        throw new Error(error.message);
    }
    throw new Error(error.message);
} 

export function handleError (error) {
    let e = error.response ? error.response.data : error;
    throw e;
}

export default Api;