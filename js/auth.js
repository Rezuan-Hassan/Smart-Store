import { auth, db, appId } from './firebase-init.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {

    // --- LOGIN PAGE LOGIC ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const loginBtn = document.getElementById('loginBtn');
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // UI feedback
            const originalBtnText = loginBtn.innerHTML;
            loginBtn.innerHTML = `<i class="ph ph-spinner-gap animate-spin text-xl"></i>`;
            loginBtn.disabled = true;
            errorMessage.classList.add('hidden');

            try {
                // Firebase Login
                await signInWithEmailAndPassword(auth, email, password);
                window.location.href = 'dashboard.html';
            } catch (error) {
                errorMessage.classList.remove('hidden');
                errorText.textContent = error.message || "Invalid credentials.";
                loginBtn.innerHTML = originalBtnText;
                loginBtn.disabled = false;
            }
        });
    }

    // --- REGISTER PAGE LOGIC ---
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        const registerBtn = document.getElementById('registerBtn');
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value;
            const storeName = document.getElementById('storeName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const originalBtnText = registerBtn.innerHTML;
            registerBtn.innerHTML = `<i class="ph ph-spinner-gap animate-spin text-xl"></i>`;
            registerBtn.disabled = true;
            errorMessage.classList.add('hidden');

            try {
                // 1. Create User in Firebase Auth
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // 2. Save additional store info into Firestore Private Collection
                const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
                await setDoc(userDocRef, {
                    fullName: fullName,
                    storeName: storeName,
                    email: email,
                    createdAt: new Date().toISOString()
                });

                window.location.href = 'dashboard.html';
            } catch (error) {
                errorMessage.classList.remove('hidden');
                errorText.textContent = error.message || "Failed to create account.";
                registerBtn.innerHTML = originalBtnText;
                registerBtn.disabled = false;
            }
        });
    }

    // --- LOGOUT LOGIC (Available on all dashboard pages) ---
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if(confirm("Are you sure you want to log out?")) {
                try {
                    await signOut(auth);
                    window.location.href = 'login.html';
                } catch (error) {
                    console.error("Logout failed", error);
                }
            }
        });
    }
});