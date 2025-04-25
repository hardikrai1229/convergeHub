import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

const SocialLoginButton = ({ handleGoogleSignIn }) => (
  <button
    onClick={handleGoogleSignIn}
    className="bg-red-500 text-white py-3 px-6 rounded w-full flex items-center justify-center mt-4"
  >
    <FontAwesomeIcon icon={faGoogle} className="mr-2 text-white" />
    <span>Continue with Google</span>
  </button>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      const userRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          username: userCredential.user.displayName || "User",
          phoneNumber: "",
          friends: [],
        });
      }

      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);

      const userRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          username: result.user.displayName || "User",
          phoneNumber: "",
          friends: [],
        });
      }

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
        <h2 className="text-3xl font-bold mb-12">Log In</h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleLogin}>
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
          <div className="mb-4">
            <input type="checkbox" className="mr-2" id="remember-me" />
            <label className="font-normal" htmlFor="remember-me">
              Remember me
            </label>
          </div>
          <button
            type="submit"
            className="bg-indigo-900 text-white py-3 px-6 rounded w-full"
          >
            Log In
          </button>
          <button className="hover:text-blue-600 font-medium py-2 px-4 rounded-lg w-full mt-4">
            Forget your password?
          </button>
        </form>

        <div className="relative">
          <hr className="my-8 border-t border-gray-300" />
          <span className="px-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800">
            Or
          </span>
        </div>

        <SocialLoginButton handleGoogleSignIn={handleGoogleSignIn} />

        <div className="text-center mt-8">
          <p className="opacity-50">Don't have an account?</p>
          <a
            href="/signup"
            className="hover:text-blue-600 font-medium text-decoration-none"
          >
            Create account
          </a>
        </div>
      </div>
    </motion.section>
  );
};

export default Login;
