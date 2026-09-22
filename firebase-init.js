/* =========================================================
   firebase-init.js — initializes Firebase for EduTask Live
   Must be loaded AFTER the firebase-*-compat.js <script> tags
   and BEFORE cloud-auth.js / teacher.js / assignments.js.
   Exposes global `auth` and `db` for the rest of the app.
   ========================================================= */
const firebaseConfig = {
  apiKey: "AIzaSyAbQGsDw0hjT5EsFnjnnnG7R16MlCEhFJI",
  authDomain: "edutask-live.firebaseapp.com",
  databaseURL: "https://edutask-live-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "edutask-live",
  storageBucket: "edutask-live.firebasestorage.app",
  messagingSenderId: "154408076355",
  appId: "1:154408076355:web:70d9d57748a157c51640f6",
  measurementId: "G-EP5TZWBBJN"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// small helper: allow plain usernames to log in without a real email
function toAuthEmail(input){
  input = (input || "").trim().toLowerCase();
  return input.includes("@") ? input : input + "@edutask.local";
}
function randomJoinCode(){
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars (0/O, 1/I)
  let code = "";
  for(let i=0;i<6;i++) code += chars[Math.floor(Math.random()*chars.length)];
  return code;
}
