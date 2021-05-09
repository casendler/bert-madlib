import { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Heading,
  Text,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Textarea,
  Button,
} from '@chakra-ui/react';

const apiUrl =
  'https://api-inference.huggingface.co/models/distilbert-base-uncased';
// move to to key manager or heroku equiv
const apiKey = 'Bearer api_gESNuszXIuDLedWQgPvIqVjsuIvuhxoBVx';

const InputForm = () => {
  const [loading, setLoading] = useState(false);
  const [userText, setUserText] = useState('');
  const [bertResponse, setBertResponse] = useState('');

  const handleChange = (value) => {
    console.log('value typed:', value);
    setUserText(value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    console.log('value submitted:', userText);
    if (userText && userText.length > 0) {
      console.log('value without errors');
      const getBertResponse = await axios({
        url: apiUrl,
        method: 'post',
        headers: {
          Authorization: apiKey,
        },
        data: {
          inputs: userText,
        },
      });

      console.log('getBertResponse', getBertResponse);
      if (getBertResponse && getBertResponse.data) {
        setBertResponse(getBertResponse.data[0].sequence);
      }
    }
    setLoading(false);
    return;
  };
  return (
    <Container mt='5%'>
      <FormControl id='email'>
        <FormLabel> Write your Mad Lib...</FormLabel>
        <Textarea
          placeholder='Write your Mad Lib...'
          value={userText}
          onChange={(e) => {
            handleChange(e.target.value);
          }}
        />
        <FormHelperText mb='10px'>
          Make sure to leave at least one _blank_ for BERT to fill in.
        </FormHelperText>
        <Button
          isLoading={loading}
          colorScheme='teal'
          variant='solid'
          size='sm'
          onClick={handleSubmit}
        >
          Submit to BERT
        </Button>
      </FormControl>
      <Heading mt='20px'>Response from BERT</Heading>
      <Text>{bertResponse}</Text>
    </Container>
  );
};

export default InputForm;
