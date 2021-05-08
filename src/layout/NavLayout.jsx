import { Flex, Spacer, Box, Image, Heading, Button } from '@chakra-ui/react';
import MadLibLogo from '../assets/mad-libs-logo.svg';

const NavLayout = () => {
  const handleClick = () => {
    window.open('https://github.com/casendler/bert-madlib', '_blank');
  };
  return (
    <Flex
      as='nav'
      px={{ base: '10px', md: '20px', lg: '40px' }}
      py='2'
      bg='#5DA2D5'
      alignItems='center'
    >
      <Box pr='2'>
        <Image
          boxSize={{ base: '30px', md: '40px' }}
          src={MadLibLogo}
          alt='Mad Libs with BERT'
        />
      </Box>
      <Box>
        <Heading
          as='h1'
          fontSize={{ base: '16px', md: '24px', lg: '30px' }}
          display={{ base: 'none', md: 'flex' }}
          color='white'
        >
          Mad Libs with BERT
        </Heading>
      </Box>
      <Spacer />
      <Box>
        <Button
          colorScheme='whiteAlpha'
          size='sm'
          variant='solid'
          onClick={handleClick}
        >
          View on GitHub
        </Button>
      </Box>
    </Flex>
  );
};

export default NavLayout;
