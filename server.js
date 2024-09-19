const express = require ('express')
const mongoose = require ('mongoose')
const cors = require ('cors')
const bodyParser = require ('body-parser')


const app = express()

app.use(cors())
app.use(bodyParser.json())

// const mongoURI = 'mongodb+srv://erkjangid2000:Kuldeep%40321@cluster0.4mhtsym.mongodb.net/API-1?retryWrites=true&w=majority&appName=Cluster0'

const mongoURI = 'mongodb+srv://erkjangid2000:Kuldeep123@cluster0.numut.mongodb.net/Activant?retryWrites=true&w=majority&appName=Cluster0'
// Connection

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDb");
}).catch((error) => {
    console.log('Error connecting to MongDb', error);
})

// Schema and Model
const UserSchema = new mongoose.Schema({
    name: String,
    email: String, 
    address: String
})

const User = mongoose.model('User', UserSchema)


// Form Submission

app.post('/api/users', async (req, res) => {
    const {name, email, address} = req.body
    const newUser = new User({name, email, address})

    try {await newUser.save()
        res.status(201).json(newUser)
    } catch (error) {
        res.status(400).json({error: 'unable to save user'})
    }
})
  


// Get users
// app.get('/api/users', async (req, res) => {
//     try {
//         const users = await User.find()
//         res.json(users)
//     } catch (error) {
//         res.status(500).json({error: "Unable to fetch users"})
//     }
// })

// Pagination
// app.get('/api/users', async (req, res) => {
//     const {page = 1, limit = 5} = req.query
//     try {
//         const pageNum = parseInt(page)
//         const limitNum = parseInt(limit)

//         const users = await user.find().limit(limitNum).skip((pageNum - 1) * limitNum)
//         const totalUsers = await User.countDocuments()
//         res.json({
//             users, totalPages: Math.ceil(totalUsers/ limitNum),
//            currentPage: pageNum 
//         })
//     } catch (error) {
//         res.status(500).json({error: 'Unable to fetch users'})
//     }
// })

app.get('/api/users', async (req, res) => {
    const { page = 1, limit = 5 } = req.query;
  
    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
  
      const users = await User.find()
                              .limit(limitNum)
                              .skip((pageNum - 1) * limitNum);
  
      const totalUsers = await User.countDocuments();
  
      res.json({
        users,
        totalPages: Math.ceil(totalUsers / limitNum),
        currentPage: pageNum,
      });
    } catch (error) {
      console.error('Error fetching users:', error);  
      res.status(500).json({ error: 'Unable to fetch users' });
    }
  });
  
// Delete user
app.delete('/api/users/:id', async (req, res) => {
    try {
        const {id} = req.params
        await User.findByIdAndDelete(id)
        res.status(200).json({message: 'user deleted successfully'})
    } catch (error) {
        res.status(500).json({error: 'unable to delete user'})
    }
})


// app.delete('/api/users/:id', async (req, res) => {
//     const { id } = req.params; 
//     try {
//       const deletedUser = await User.findByIdAndDelete(id); 
//       if (!deletedUser) {
//         return res.status(404).json({ error: 'User not found' }); 
//       }
//       res.status(200).json({ message: 'User deleted successfully' }); 
//     } catch (error) {
//       res.status(500).json({ error: 'Unable to delete user' }); 
//     }
//   });

// Update user
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params; 
    const { name, email, address } = req.body; 

    try {
        const updatedUser = await User.findByIdAndUpdate(id, { name, email, address }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Unable to update user' });
    }
});







// Server
const PORT = process.env.port || 5000
app.listen(PORT, () => {
    console.log(`server is running on: ${PORT}`);
})