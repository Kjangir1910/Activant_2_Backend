const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require ('bcrypt')

const app = express();

app.use(cors());
app.use(bodyParser.json());

const mongoURI = 'mongodb+srv://erkjangid2000:Kuldeep123@cluster0.numut.mongodb.net/Activant?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.log('Error connecting to MongoDB', error);
});

// Schema and Model for products
const ProductSchema = new mongoose.Schema({
    productName: String,
    productId: String,
    description: String,
});

const UserSchema = new mongoose.Schema({
    name: String,
    email: String, 
    address: String,
    password: String
})

const User = mongoose.model('User', UserSchema)
const Product = mongoose.model('Product', ProductSchema);

// Register User
// app.post('api/users/register', async (req, res) => {
//     const {name, email, address, password} = req.body;

//     if(!name || !email || !address || !password) {
//       return  res.status(400).json({error: "All fields are required"})
//     }

//     if(name.trim() === '' || email.trim() === '' || address.trim() === '' || password.trim() === ''){
//       return  res.status(400).json({error: 'Fields can not be empty or white space'})
//     }

//     try {
//         const existingUser = await User.findOne({email});
//         if(existingUser) {
//             return res.status(400).json({error: 'User already registered'})
//         }

//         // Crate User
//         const hashedPassword = await bcrypt.hash(password, 10)
//         const newUser = ({name, email, address, password: hashedPassword})
//         await newUser.save()
//         res.status(200).json({message: "User registered successfully"})
//     } catch (error) {
//         res.status(400).json({error: 'Unable to save user'})
//     }
// })

// Register User
app.post('/api/users/register', async (req, res) => {
    const {name, email, address, password} = req.body;

    if(!name || !email || !address || !password) {
        return res.status(400).json({error: "All fields are required"});
    }

    if(name.trim() === '' || email.trim() === '' || address.trim() === '' || password.trim() === '') {
        return res.status(400).json({error: 'Fields can not be empty or whitespace'});
    }

    try {
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({error: 'User already registered'});
        }

        // Create User
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({name, email, address, password: hashedPassword});
        await newUser.save();
        res.status(200).json({message: "User registered successfully"});
    } catch (error) {
        res.status(400).json({error: 'Unable to save user'});
    }
});




// Login User
// app.post('api/users/login', async (req, res) => {
//     const {email, password} = req.body

    // Validate
//     if(!email || !password) {
//         return res.status(400).json({error: 'email or password are required'})
//     }

//     try {
//         const user = await User.findOne({email})

//         if(!user) {
//             return res.status(400).json({error: 'User not found'})

//         }

//         const isMatch = await bcrypt.compare(password, user.password)
//         if(!isMatch) {
//             res.status(400).json({error: 'Incorrect Password'})
//         }

//         res.status(200).json({user})
//     } catch (error) {
//         res.status(500).json({error: 'Server error'})
//     }
// })

app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect password.' });
        }

        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});



// Add new product
app.post('/api/products', async (req, res) => {
    const { productName, productId, description } = req.body;

    if (!productName || !productId || !description) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    if (productName.trim() === '' || productId.trim() === '' || description.trim() === '') {
        return res.status(400).json({ error: 'Fields cannot be empty or just whitespace.' });
    }

    const newProduct = new Product({ productName, productId, description });

    try {
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ error: 'Unable to save product.' });
    }
});

// Get products with pagination
app.get('/api/products', async (req, res) => {
    const { page = 1, limit = 5 } = req.query;

    try {
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const products = await Product.find()
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        const totalProducts = await Product.countDocuments();

        res.json({
            products,
            totalPages: Math.ceil(totalProducts / limitNum),
            currentPage: pageNum,
        });
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch products' });
    }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { productName, productId, description } = req.body;

    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, { productName, productId, description }, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Unable to update product' });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Product.findByIdAndDelete(id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Unable to delete product' });
    }
});




// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
