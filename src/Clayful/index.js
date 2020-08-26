const clayful = require('clayful')
const Product = clayful.Product

clayful.config({ client: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6ImU4YzZlNWUyYmQ5N2RjY2ZmMTU5MjUxMDY5Yjk1ZjRlN2I5ZmUzNjdlOTBiMTUwYTNlNjQ4ZWE3ZTRkNjM3YjMiLCJyb2xlIjoiY2xpZW50IiwiaWF0IjoxNTk4MjY3MzA3LCJzdG9yZSI6IlUzQjIzUkZES0cyQy5WN1RBOFZaOVZGTVUiLCJzdWIiOiI0MjJOSFpCSlJTR0EifQ.24zIw6ANmIO10Ha2SySl8QZO1cuBwm5KwnH5MtUuaMc' })


const options = {
    query: {
        page: 1
    }
};

const a = () => Product.list(options)
.then(response =>{
    return response
}).catch(err=>{
    console.log(err.isClayful);
    console.log(err.model);
    console.log(err.method);
    console.log(err.status);
    console.log(err.headers);
    console.log(err.code);
    console.log(err.message);
})

module.exports = a