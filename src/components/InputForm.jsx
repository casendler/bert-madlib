import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Heading,
  Text,
  Link,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Textarea,
  Button,
  Divider,
} from '@chakra-ui/react';

const apiUrl =
  'https://api-inference.huggingface.co/models/distilbert-base-uncased';
// move to to key manager or heroku equiv
const apiKey = `Bearer ${process.env.REACT_APP_HF_API_KEY}`;

const sentenceRegex = /[^.!?]+[.!?]+["']?|.+$/g;

const occurrences = (string, subString) => {
  string += '';
  subString += '';
  if (subString.length <= 0) return 0;

  let n = 0,
    p = 0,
    step = subString.length;

  while (true) {
    p = string.indexOf(subString, p);
    if (p >= 0) {
      ++n;
      p += step;
    } else break;
  }
  return n;
};

const InputForm = () => {
  const [loading, setLoading] = useState(false);
  const [userText, setUserText] = useState('');
  const [sentences, setSentences] = useState([]);
  const [bertResponse, setBertResponse] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    sentences.forEach((i) => {
      if (occurrences(i, '__') > 1) {
        setErrorMessage('Only one __ allowed per sentence.');
        return;
      }
    });
  }, [sentences]);

  const checkSubmittedText = (value) => {
    // Set default return value
    let valuePassed = true;

    // Check if we got any text from the user
    if (!value) {
      setErrorMessage("You didn't write anything!");
      valuePassed = false;
      return valuePassed;
    }

    if (!value.includes('__')) {
      setErrorMessage('Please provide at least one __ for BERT to fill in.');
      valuePassed = false;
      return valuePassed;
    }

    return valuePassed;
  };

  const handleChange = (value) => {
    setErrorMessage('');
    setUserText(value);
    if (value) {
      const sentencesArray = value
        .trim()
        .match(sentenceRegex)
        .map((i) => {
          return i.trim();
        });
      setSentences(sentencesArray);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (checkSubmittedText(userText)) {
      const swapForMask = userText.replaceAll('__', '[MASK]');
      const getBertResponse = await axios({
        url: apiUrl,
        method: 'post',
        headers: {
          Authorization: apiKey,
        },
        data: {
          inputs: swapForMask,
        },
      });

      if (getBertResponse && getBertResponse.data) {
        setBertResponse(getBertResponse.data[0].sequence);
      }
    }
    setLoading(false);
    return;
  };

  const handleReset = () => {
    setLoading(false);
    setUserText('');
    setSentences([]);
    setBertResponse('');
    setErrorMessage('');
  };

  return (
    <Container mt='5vh'>
      <FormControl id='email' isInvalid={errorMessage}>
        <FormLabel>
          <Heading as='h2' size='lg'>
            Play Mad Libs with BERT
          </Heading>
        </FormLabel>
        <FormHelperText mb='10px'>
          <b>Use a __ (double underscore) for blank spaces.</b>
          <br />
          <br /> This mini-app uses a DistilBERT model focused on Masked
          Language Modeling ('MLM') to predict masked words in a sentence. In
          this case, we're manually placing the masked words as blank spaces.
          While Mad Libs are not the intended purpose of this model, it's still
          fun to play with!
        </FormHelperText>
        <Textarea
          placeholder='Write your Mad Lib here...'
          value={userText}
          onChange={(e) => {
            handleChange(e.target.value);
          }}
        />
        <FormErrorMessage pb='12px'>{errorMessage}</FormErrorMessage>

        <Button
          isLoading={loading}
          isDisabled={errorMessage}
          colorScheme='teal'
          variant='solid'
          size='sm'
          onClick={handleSubmit}
        >
          Fill in the blanks!
        </Button>
        <Button
          ml='5px'
          colorScheme='red'
          variant='solid'
          size='sm'
          onClick={handleReset}
        >
          Reset
        </Button>
      </FormControl>
      {bertResponse && (
        <>
          <Divider my='20px' />
          <Heading as='h2' size='md'>
            BERT's completed Mad Lib:
          </Heading>
          <Text mt='15px'>{bertResponse}</Text>
        </>
      )}
      <Divider my='20px' />
      <Text fontSize='sm'>
        <span role='img' aria-label='megaphone'>
          📣
        </span>{' '}
        Shout out to{' '}
        <Link
          color='teal'
          href='https://huggingface.co/julien-c'
          target='_blank'
          title='Julien Hugging Face Profile'
        >
          Julien
        </Link>{' '}
        & the{' '}
        <Link
          color='teal'
          href='https://huggingface.co/distilbert-base-uncased'
          target='_blank'
          title='Hugging Face DistilBERT Model Docs'
        >
          Hugging Face
        </Link>{' '}
        team for the model and API.
      </Text>
    </Container>
  );
};

export default InputForm;
