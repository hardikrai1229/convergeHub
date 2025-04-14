import React, { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { doc, setDoc } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

const SocialLoginButton = ({ handleGoogleSignUp }) => (
  <button
    onClick={handleGoogleSignUp}
    className="bg-red-500 text-white py-3 px-6 rounded w-full flex items-center justify-center mt-4"
  >
    <FontAwesomeIcon icon={faGoogle} className="mr-2 text-white" />
    <span>Continue with Google</span>
  </button>
);

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        username: username,
        phoneNumber: "",
        friends: [],
      });

      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);

      await updateProfile(result.user, { displayName: result.user.displayName || "User" });

      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        username: result.user.displayName || "User",
        phoneNumber: "",
        friends: [],
      });

      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <motion.section
      className="flex-1 flex items-center justify-center text-indigo-900 dark:text-white bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "url(https://cdn.easyfrontend.com/pictures/sign-in-up/sign-in-up-1.png)",
        padding: "3rem",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 lg:p-10">
        <h2 className="text-3xl font-bold mb-12">Sign Up</h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label className="block mb-2 font-normal" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              className="w-full bg-blue-50 dark:bg-slate-700 min-h-[48px] leading-10 px-4 p-2 rounded-lg outline-none border border-transparent focus:border-blue-600"
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-normal" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              className="w-full bg-blue-50 dark:bg-slate-700 min-h-[48px] leading-10 px-4 p-2 rounded-lg outline-none border border-transparent focus:border-blue-600"
              id="email"
              placeholder="Enter Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-normal" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              className="w-full bg-blue-50 dark:bg-slate-700 min-h-[48px] leading-10 px-4 p-2 rounded-lg outline-none border border-transparent focus:border-blue-600"
              id="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-900 text-white py-3 px-6 rounded w-full"
          >
            Sign Up
          </button>
        </form>

        <div className="relative">
          <hr className="my-8 border-t border-gray-300" />
          <span className="px-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800">
            Or
          </span>
        </div>

        <SocialLoginButton handleGoogleSignUp={handleGoogleSignUp} />

        <div className="text-center mt-8">
          <p className="opacity-50">Already have an account?</p>
          <a
            href="/login"
            className="hover:text-blue-600 font-medium text-decoration-none"
          >
            Sign In
          </a>
        </div>
      </div>
    </motion.section>
  );
};

export default Signup;
