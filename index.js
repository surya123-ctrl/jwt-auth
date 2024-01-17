const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
                            res.status(500).send({ message: "Error in inserting user in database", error });
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
                        // generate a token and send to frontend
                        //jwt token are generated with three things i.e. Headers, Payload, Secret Key
                        jwt.sign({ email: email }, "Surya", (err, token) => {
                            if (!err) {
                                console.log("token : ", token);
                                res.status(201).send({ token: token });
                            }
                            else {
                                console.log("Error in generating Token");
                                res.status(500).send({ message: "Error in generating Token" })
                            }
                        })
                    }
                    else {
                        return res.status(401).json({ message: 'Password is incorrect' });
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

const isAuthenticated = (req, res, next) => {
    if (!req.headers.authorization) res.status(401).send({ message: "Please login to access data" });
    else {
        const token = req.headers.authorization.split(" ")[1];
        console.log(token);
        jwt.verify(token, "Surya", (err, data) => {
            if (!err) {
                console.log(data);
                next();
            }
            else {
                res.status(401).send({ message: "Invalid Token" });
            }
        })
    }

    res.send("Coming from middleware");
}

app.get('/data', isAuthenticated, (req, res) => {
    res.send({ message: "This is private data" });
})

app.listen(3000, (req, res) => {
    console.log("Server is running on port 3000");
})





















