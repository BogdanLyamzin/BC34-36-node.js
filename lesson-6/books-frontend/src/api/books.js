import axios from "axios";

const {REACT_APP_API_URL} = process.env;

const booksInstance = axios.create({
    baseURL: `${REACT_APP_API_URL}/books`
})

export const requestBooks = async() => {
    const {data} = await booksInstance.get("/");
    console.log(data);
    return data;
}