import mongoose from 'mongoose'
import 'dotenv/config'

const uri = process.env.ATLAS_URI || ''
const options = {
	autoIndex: true,
}

const connectToAtlas = async () => {
	try {
		await mongoose.connect(uri, options)
		console.log("Successfully connected to Atlas")
	}
	catch (err) {
		console.log(err.stack);
	}
}

export { connectToAtlas }