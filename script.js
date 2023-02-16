// form loading animation

const form = [...document.querySelector('.form').children];

form.forEach((item, i) => {
    setTimeout(() => {
        item.style.opacity = 1;
    }, i*100);
})

window.onload = () => {
    if(sessionStorage.name){
        location.href = '/';
    }
}

// form validation

const name = document.querySelector('.name') || null;
const email = document.querySelector('.email');
const password = document.querySelector('.password');
const submitBtn = document.querySelector('.submit-btn');

if(name == null){ // means login page is open
    submitBtn.addEventListener('click', () => {
        fetch('/login-user',{
            method: 'post',
            headers: new Headers({'Content-Type': 'application/json'}),
            body: JSON.stringify({
                email: email.value,
                password: password.value
            })
        })
        .then(res => res.json())
        .then(data => {
            validateData(data);
        })
    })
} else{ // means register page is open

    submitBtn.addEventListener('click', () => {
        fetch('/register-user', {
            method: 'post',
            headers: new Headers({'Content-Type': 'application/json'}),
            body: JSON.stringify({
                name: name.value,
                email: email.value,
                password: password.value
            })
        })
        .then(res => res.json())
        .then(data => {
            validateData(data);
        })
    })

}

const validateData = (data) => {
    if(!data.name){
        alertBox(data);
    } else{
        sessionStorage.name = data.name;
        sessionStorage.email = data.email;
        location.href = '/';
    }
}

const alertBox = (data) => {
    const alertContainer = document.querySelector('.alert-box');
    const alertMsg = document.querySelector('.alert');
    alertMsg.innerHTML = data;

    alertContainer.style.top = `5%`;
    setTimeout(() => {
        alertContainer.style.top = null;
    }, 5000);
}

const greeting = document.querySelector('.greeting');

window.onload = () => {
    if(!sessionStorage.name){
        location.href = '/login';
    } else{
        greeting.innerHTML = `hello ${sessionStorage.name}`;
    }
}

const logOut = document.querySelector('.logout');

logOut.onclick = () => {
    sessionStorage.clear();
    location.reload();}


    const express = require('express');
    const path = require('path');
    const bodyParser = require('body-parser');
    const knex = require('knex');
    
    const db = knex({
        client: 'pg',
        connection: {
            host: '127.0.0.1',
            user: 'postgres',
            password: 'test',
            database: 'loginformytvideo'
        }
    })
    
    const app = express();
    
    let intialPath = path.join(__dirname, "public");
    
    app.use(bodyParser.json());
    app.use(express.static(intialPath));
    
    app.get('/', (req, res) => {
        res.sendFile(path.join(intialPath, "index.html"));
    })
    
    app.get('/login', (req, res) => {
        res.sendFile(path.join(intialPath, "login.html"));
    })
    
    app.get('/register', (req, res) => {
        res.sendFile(path.join(intialPath, "register.html"));
    })
    
    app.post('/register-user', (req, res) => {
        const { name, email, password } = req.body;
    
        if(!name.length || !email.length || !password.length){
            res.json('fill all the fields');
        } else{
            db("users").insert({
                name: name,
                email: email,
                password: password
            })
            .returning(["name", "email"])
            .then(data => {
                res.json(data[0])
            })
            .catch(err => {
                if(err.detail.includes('already exists')){
                    res.json('email already exists');
                }
            })
        }
    })
    
    app.post('/login-user', (req, res) => {
        const { email, password } = req.body;
    
        db.select('name', 'email')
        .from('users')
        .where({
            email: email,
            password: password
        })
        .then(data => {
            if(data.length){
                res.json(data[0]);
            } else{
                res.json('email or password is incorrect');
            }
        })
    })
    
    app.listen(3000, (req, res) => {
        console.log('listening on port 3000......')
    })   