"use client";

import { useRouter } from "next/navigation"; // Correct import for Next.js App Router
import Header from "../app/components/header";
import ItemList from "../app/components/data";
import Chatbot from "../app/components/Chatbot";

export default function Home() {
  const router = useRouter();

  // Function to navigate with smooth transition
  const handleNavigation = () => {
    document.body.classList.add("fade-out"); // Apply fade-out effect
    setTimeout(() => {
      router.push("/selection");
      document.body.classList.remove("fade-out"); // Remove class after navigation
    }, 300); // Delay to match transition
  };

  return (
    <div className="fade-in min-h-screen bg-base-100">
      <Header />
      <div className="pt-20 flex flex-col items-center justify-center space-y-6">
        <ItemList />
        <button
          className="btn btn-primary transition-transform duration-300 hover:scale-105"
          onClick={handleNavigation}
        >
          Enter to Buy
        </button>
      </div>

      <div className="fixed bottom-5 right-5">
        <Chatbot />
      </div>

      {/* Global Tailwind Styles for Smooth Page Transition */}
      <style jsx global>{`
        .fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        .fade-out {
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
