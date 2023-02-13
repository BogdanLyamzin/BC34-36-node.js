const jwt = require("jsonwebtoken");
require("dotenv").config();

const {SECRET_KEY} = process.env;

const payload = {
    id: "63ea653842a57ae49eab087b"
}

const token = jwt.sign(payload, SECRET_KEY, {expiresIn: "23h"});
// console.log(token);

const decodeToken = jwt.decode(token);
console.log(decodeToken);

try {
    const result = jwt.verify(token, SECRET_KEY);
    // console.log(result);
    const invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzZWE2NTM4NDJhNTdhZTQ5ZWFiMDg3YiIsImlhdCI6MTY3NjMwNjk1NSwiZXhwIjoxNjc2Mzg5NzU1fQ.Nc3HBYooF8-9pKPnvb7XzmEC06k5RztTiwuv3-HWMHu";
    const result2 = jwt.verify(invalidToken, SECRET_KEY);
    // console.log(result2);
}
catch(error) {
    console.log(error.message);
}
