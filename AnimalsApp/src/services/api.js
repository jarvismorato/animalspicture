let SERVER_URL = 'https://animalspicture.onrender.com'; // Live global server

export const setServerUrl = (url) => {
    if (url) {
        SERVER_URL = url.replace(/\/$/, ''); // Remove trailing slash
    }
};

export const getServerUrl = () => SERVER_URL;

export const uploadImage = async (base64, email) => {
    try {
        const res = await fetch(`${SERVER_URL}/api/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64, email })
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.url;
    } catch (e) {
        console.error('uploadImage error', e);
        return null;
    }
};

export const getPosts = async (page = 1, sort = 'newest') => {
    try {
        const res = await fetch(`${SERVER_URL}/api/posts?page=${page}&sort=${sort}`);
        if (!res.ok) return { posts: [], hasMore: false };
        return await res.json();
    } catch (e) {
        console.error('getPosts error', e);
        return { posts: [], hasMore: false };
    }
};

export const createPost = async (post, email) => {
    try {
        const res = await fetch(`${SERVER_URL}/api/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...post, email })
        });
        return res.ok;
    } catch (e) {
        console.error('createPost error', e);
        return false;
    }
};

export const deletePost = async (postId, email) => {
    try {
        const res = await fetch(`${SERVER_URL}/api/posts/${postId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        return res.ok;
    } catch (e) {
        console.error('deletePost error', e);
        return false;
    }
};

export const toggleLike = async (postId, email) => {
    try {
        const res = await fetch(`${SERVER_URL}/api/posts/${postId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        return res.ok;
    } catch (e) {
        console.error('toggleLike error', e);
        return false;
    }
};

export const getComments = async (postId) => {
    try {
        const res = await fetch(`${SERVER_URL}/api/posts/${postId}/comments`);
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error('getComments error', e);
        return [];
    }
};

export const addComment = async (postId, comment, email) => {
    try {
        const res = await fetch(`${SERVER_URL}/api/posts/${postId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...comment, email })
        });
        return res.ok;
    } catch (e) {
        console.error('addComment error', e);
        return false;
    }
};
