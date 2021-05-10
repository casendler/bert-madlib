import { Box } from '@chakra-ui/react';

import NavLayout from './layout/NavLayout';
import InputForm from './components/InputForm';

function App() {
  return (
    <Box bg='#5DA2D5' h='100vh'>
      <NavLayout />
      <InputForm />
    </Box>
  );
}

export default App;
