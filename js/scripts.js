

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, remove, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCHILAbuzwJ4uzS-Z70vCQ3KX4lfbBZy6w",
    authDomain: "test1-ea5d4.firebaseapp.com",
    projectId: "test1-ea5d4",
    storageBucket: "test1-ea5d4.appspot.com",
    messagingSenderId: "862905085162",
    appId: "1:862905085162:web:8f80fac31d23ace49c3b93",
    measurementId: "G-HJ64K3PBHJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);




//  Register User
function registerUser() {
    console.log("Register button clicked!");
    
    let email = document.getElementById("reg-email").value.trim();
    let password = document.getElementById("reg-password").value.trim();
    let confirmPassword = document.getElementById("confirm-password").value.trim();
    let errorMessage = document.getElementById("error-message");
    
    errorMessage.textContent = "";
    
    if (!email || !password || !confirmPassword) {
        errorMessage.textContent = "All fields are required!";
        return;
    }

    if (password.length < 6) {
        errorMessage.textContent = "Password must be at least 6 characters long!";
        return;
    }

    if (password !== confirmPassword) {
        errorMessage.textContent = "Passwords do not match!";
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("✅ Registration successful!");
            let user = userCredential.user;
            return set(ref(database, "users/" + user.uid), {
                email: user.email,
                uid: user.uid
            });
        })
        .then(() => {
            console.log("✅ User data saved!");
           
            window.location.href = "tenant.html";
        })
        .catch((error) => {
            errorMessage.textContent = "Error: " + error.message;
            console.error("🔥 Firebase Auth Error:", error);
        });
}

// 📌 Login User
function loginUser() {
    console.log("Login button clicked!");
    let email = document.getElementById("login-email").value.trim();
    let password = document.getElementById("login-password").value.trim();
    let errorMessage = document.getElementById("login-error-message");

    errorMessage.textContent = "";

    if (!email || !password) {
        errorMessage.textContent = "Please enter email and password!";
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("✅ Login successful!");
            alert("Login successful! Redirecting...");
            window.location.href = "dashboard.html";
        })
        .catch((error) => {
            errorMessage.textContent = "Error: " + error.message;
            console.error("🔥 Firebase Auth Error:", error);
        });
}


// 📌 Logout User Function
function logoutUser() {
    console.log("Logout button clicked!");

    signOut(auth)
        .then(() => {
            console.log("✅ Successfully logged out!");

            // Reset localStorage (if you're using it)
            localStorage.setItem("isLoggedIn", "false");

           
            window.location.href = "index.html"; // Redirect to homepage
        })
        .catch((error) => {
            console.error("🔥 Logout Error:", error);
        });
}

// 📌 Attach Logout Button Event Listener
document.addEventListener("DOMContentLoaded", function () {
    const logoutButton = document.getElementById("lug"); // Target the correct ID
    if (logoutButton) {
        logoutButton.addEventListener("click", logoutUser);
        console.log("✅ Logout button event listener attached!");
    } else {
        console.error("❌ Logout button not found in DOM!");
    }
});





// 📌 Save Feedback
function save() {
    const name = document.getElementById("name").value.trim();
    const roomnum = document.getElementById("room-number").value.trim();
    const con = document.getElementById("concern").value.trim();
    const date = new Date().toLocaleString();

    if (!name || !roomnum || !con) {
        alert("All fields are required.");
        return;
    }

    const userRef = ref(database, "feedbacks/" + name);
    set(userRef, { name, roomnum, concern: con, date })
        .then(() => {
            alert("Data sent successfully!");
            clearInputs();
            displayData(); // Refresh feedback list
        })
        .catch((error) => {
            console.error("Error sending data:", error);
        });
}

// 📌 Function to clear inputs
function clearInputs() {
    document.getElementById("name").value = "";
    document.getElementById("room-number").value = "";
    document.getElementById("concern").value = "";
}

// 📌 Display Feedback Data
function displayData() {
    const feedbacksRef = ref(database, "feedbacks/");

    onValue(feedbacksRef, (snapshot) => {
        const data = snapshot.val();
        console.log("Fetched data:", data); // Debugging line

        const displayDiv = document.getElementById("feedback-list");
        displayDiv.innerHTML = ""; // Clear previous content
        
        if (data) {
            const sortedData = Object.values(data).sort((a, b) => new Date(b.date) - new Date(a.date));

            sortedData.forEach((feedback) => {
                const feedbackElement = document.createElement("div");
                feedbackElement.classList.add("inp");

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.classList.add("del");

                deleteButton.onclick = () => {
                    console.log("Delete button clicked!");
                    const feedbackRef = ref(database, "feedbacks/" + feedback.name);
                    remove(feedbackRef).then(() => {
                        console.log("Feedback deleted successfully!");
                        displayData(); // Refresh after delete
                    }).catch((error) => {
                        console.error("Error deleting feedback:", error);
                    });
                };

                feedbackElement.innerHTML = `
                <p><strong>Name:</strong> ${feedback.name}</p>
                <p><strong>Room Number:</strong> ${feedback.roomnum}</p>
                <p><strong>Concern:</strong> ${feedback.concern}</p>
                <p><strong>Date:</strong> ${feedback.date}</p>
            `;
                feedbackElement.appendChild(deleteButton);
                displayDiv.appendChild(feedbackElement);
            });
        } else {
            displayDiv.innerHTML = "<p style='color:white;'>No feedback available.</p>";
        }
    }, (error) => {
        console.error("Firebase read failed:", error);
    });
}

// 📌 Attach Event Listeners
document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("register")) document.getElementById("register").addEventListener("click", registerUser);
    if (document.getElementById("login")) document.getElementById("login").addEventListener("click", loginUser);
    if (document.getElementById("logout")) document.getElementById("logout").addEventListener("click", logoutUser);

   
});


function Logintenant() {
    console.log("🔹 Tenant login attempt...");

    let email = document.getElementById("tentemail")?.value.trim();
    let password = document.getElementById("tentpassword")?.value.trim();
    let errorMessage = document.getElementById("error-message");

    if (!email || !password) {
        errorMessage.textContent = "❌ Please enter email and password!";
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("✅ Tenant login successful!", userCredential);
            const user = userCredential.user;

            // ✅ Fetch user data from Firebase Realtime Database
            const userRef = ref(database, "users/" + user.uid);
            get(userRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        console.log("📌 User data found:", snapshot.val());

                        // Store login status
                        localStorage.setItem("isLoggedIn", "true");

                        
                        window.location.href = "input.html";
                    } else {
                       
                    }
                })
                .catch((error) => {
                    console.error("🔥 Firebase Database Error:", error);
                    errorMessage.textContent = "❌ Error fetching user data.";
                });
        })
        .catch((error) => {
            console.error("🔥 Firebase Auth Error:", error);
            errorMessage.textContent = "❌ Incorrect Email or Password.";
        });
}


// Ensure event listener is attached correctly
document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.getElementById("login");
    if (loginButton) {
        loginButton.addEventListener("click", Logintenant);
        console.log("✅ Login button event listener attached!");
    } else {
        console.error("❌ Login button not found in DOM!");
    }
});







window.onload = function () {
    console.log("Window loaded, attaching login button event.");
    const loginButton = document.getElementById("login");
    if (loginButton) {
        loginButton.addEventListener("click", Logintenant);
        console.log("✅ Login button event listener attached!");
    } else {
        console.error("❌ Login button not found in DOM!");
    }
};





window.resetPassword = function () {
    const email = document.getElementById("tentemail").value;
    const errorMessage = document.getElementById("error-message");
    const successMessage = document.getElementById("success-message");

    if (email.trim() === "") {
        errorMessage.innerText = "Please enter your email.";
        successMessage.innerText = "";
        return;
    }

    sendPasswordResetEmail(auth, email)
        .then(() => {
            successMessage.innerText = "Password reset email sent! Check your inbox.";
            errorMessage.innerText = "";
        })
        .catch((error) => {
            errorMessage.innerText = "Error: " + error.message;
            successMessage.innerText = "";
        });
};

document.addEventListener("DOMContentLoaded", function () {
    const resetLink = document.querySelector(".reset");
    if (resetLink) {
        resetLink.addEventListener("click", resetPassword);
        console.log("✅ Reset password event listener attached!");
    } else {
        console.error("❌ Reset password button not found!");
    }
});



console.log("✅ resetPassword function is now defined:", window.resetPassword);











console.log(window.resetPassword);
window.save = save;
window.onload = displayData; // Load feedbacks on page load