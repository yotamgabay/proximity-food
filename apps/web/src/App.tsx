import { MapContainer } from "@/components/MapContainer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="h-screen w-screen overflow-hidden">
        <MapContainer />
      </main>
    </QueryClientProvider>
  );
}

export default App;
