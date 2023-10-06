import Work from "./Work";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  
  return (
    <QueryClientProvider client={queryClient}>
      <Work />
    </QueryClientProvider>
  )
}

export default App;
