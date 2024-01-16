const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
//database connection
const uri = "mongodb+srv://suryatomar303:Surya%40123@cluster0.i1ultl8.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Could not connect to MongoDB", err));

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
}, { timestamps: true })
const userModel = mongoose.model("users", userSchema);



//endpoints
//register
const app = express();
app.use(express.json());

app.post('/register', (req, res) => {
    console.log(req.body);
    const user = req.body;
    bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        else {
            bcrypt.hash(user.password, salt, (err, hashedPassword) => {
                if (err) throw err;
                else {
                    user.password = hashedPassword;
                    userModel.create(user)
                        .then((createdUser) => {
                            res.status(201).send({ createdUser, message: "User registration successful" });
                        }).catch((error) => {
                            res.status(400).send({ message: "Error in inserting user in database", error });
                        });
                }
            })
        }
    })
});

//login
app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    userModel.findOne({ email: email })
        .then((user) => {
            if (user) {
                bcrypt.compare(password, user.password, (err, result) => {
                    if (result) {
                        console.log({ user, message: "Logged In" });
                        res.status(200).send({ user, message: "Logged In" })
                    }
                    else {
                        return res.status(401).json({ message: 'Email or Password is incorrect' });
                    }
                })
            }
            else {
                res.status(404).send({ message: "Wrong Email" });
            }
        })
        .catch((error) => {
            res.status(500).send({ message: 'Could not find user in database' });
        })

})

app.listen(3000, (req, res) => {
    console.log("Server is running on port 3000");
})






















