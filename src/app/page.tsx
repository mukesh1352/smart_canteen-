import Header from "./components/header";
import ItemList from "./components/data";

export default function Home() {
  return (
    <div>
      <Header />
      {/* Add padding to make room for the fixed header */}
      <div className="pt-20">
        <ItemList />
      </div>
    </div>
  );
}
