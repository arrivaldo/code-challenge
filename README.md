# Simple Developer Exercise 

The savvy cats over at SMART Pump would like to be able to allow users to login to their account, check their balance and update their personal details. Write a simple web application (API and UI) using node.js and lowdb that lets users accomplish those tasks. 

Feel free to use any other libraries or tool chains as long as the core code is javascript and node.js. npm (https://www.npmjs.org) is your friend - no need to recreate the wheel. 

You will find the base data file in `/data`

Wireframes: `assets/wireframes.png`

## Time limits

This exercise is meant showcase your creativity and talent in problem solving against a real world scenario. To that end it should not consume your every waking moment. We recommend at max spending 3 evenings of time on the exercise. 

## Requirements

* Login to the app via email and password
* Restrict access to valid a User
* Once logged in show the details of the user on the page
* Authorized users can check their account balance
* Allow the user to change their details
* lowdb (DB) -> https://github.com/typicode/lowdb
* node.js -> http://nodejs.org/ 

## Bonus Points

* Fully responsive UI
* Unit Tests of the API
* Functional Tests of the UI

# Additional Functionalities Added:

Admin Sign-In: Admins can log in with an email and password and access admin-specific features.

Completely functional sign up page.

Role-Based Access: User roles are checked via the isAdmin flag to determine the user's access level, distinguishing users from admins.

Image Upload: Users can upload profile images. These images are stored on Cloudinary, providing a secure URL for later access.

Multer Integration: Utilizes Multer to handle file uploads and ensure file validation before storing.

Image Deletion: Admins have the capability to delete users, and in doing so, any associated image is also deleted from Cloudinary.

View All Users: Admins can view all registered users' information. Sensitive details like passwords are excluded for security purposes.

User Status Toggle: Admins can activate or deactivate users' accounts, preventing them from accessing the system when inactive.

User Deletion: Admins can delete users, and their images are automatically removed from Cloudinary.

## 🔧 How to Use
To get started, clone the repository using the URL below:

git clone https://github.com/arrivaldo/code-challenge.git


Move into the API directory:

cd api


Run npm install to install all necessary dependencies:

npm install


After installing the dependencies, start the backend server with:

npm start


The server will run at http://localhost:5000/api.



Next, move into the Client directory:

cd client

Run npm install to install all necessary dependencies for the frontend:

npm install


After installing the dependencies, start the frontend development server with:

npm run dev


# Admin Credentials

admin@gmail.com
admin123
