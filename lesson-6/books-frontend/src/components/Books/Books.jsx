import {useState, useEffect} from "react";

import {requestBooks} from "../../api/books";

const Books = () => {
    const [books, setBooks] = useState([]);

    useEffect(()=> {
        const fetchBooks = async() => {
            try {
                const result = await requestBooks();
                setBooks(result);
            }
            catch({response}) {
                console.log(response.data.message);
            }
        }

        fetchBooks()
    }, []);

    const elements = books.map(({_id, title}) => <li key={_id}>{title}</li>);

    return (
        <ul>
            {elements}
        </ul>
    )
}
 
export default Books;