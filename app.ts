import express from 'express'
import cors from 'cors'

const PORT = process.env.PORT || 5050
const app = express()

app.use(cors)
app.use(express.json())

app.get('/', (req, res) => {
	res.send('Hello World!')
})

app.listen(PORT, () => {
	return console.log(`Server listening at http://localhost:${PORT}`)
})