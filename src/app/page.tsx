import Header from "./components/header";
import ItemList from "./components/data";
import Chatbot from "./components/Chatbot"; // Import Chatbot

export default function Home() {
  return (
    <div>
      <Header />
      {/* Add padding to make room for the fixed header */}
      <div className="pt-20">
        <ItemList />
      </div>

      {/* Chatbot Component */}
      <div className="fixed bottom-5 right-5">
        <Chatbot />
      </div>
    </div>
  );
}
