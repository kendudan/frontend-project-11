import axios from "axios";

export default (url) => {
    const base = new URL('https://allorigins.hexlet.app/get');
    const searchURL = encodeURI(url);
    base.searchParams.set('disableCache', 'true');
    base.searchParams.set('url', searchURL);
    return axios.get(base);
}