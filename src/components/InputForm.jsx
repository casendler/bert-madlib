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
  const [startingSentences, setStartingSentences] = useState([]);
  const [completedSentences, setCompletedSentences] = useState([]);
  const [bertResponse, setBertResponse] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Provides real-time error feedback if more than one blank is provided with a sentence.
  useEffect(() => {
    if (startingSentences.length > 0) {
      startingSentences.forEach((i) => {
        if (occurrences(i, '[MASK]') > 1) {
          setErrorMessage('Only one __ allowed per sentence.');
          return;
        }
      });
    }
    return;
  }, [startingSentences]);

  // Composes the final response from 'BERT'
  useEffect(() => {
    if (completedSentences.length > 0) {
      setBertResponse(completedSentences.join(' '));
    }
    return;
  }, [completedSentences]);

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

  const processWithBert = async () => {
    let finalArray = [];
    for (const sentence of startingSentences) {
      const response = await axios({
        url: apiUrl,
        method: 'post',
        headers: {
          Authorization: apiKey,
        },
        data: {
          inputs: sentence,
        },
      });
      if (response && response.data) {
        const formattedSentence =
          response.data[0].sequence.charAt(0).toUpperCase() +
          response.data[0].sequence.slice(1);
        finalArray.push(formattedSentence);
      }
    }
    setCompletedSentences(finalArray);
    return;
  };

  const handleChange = (value) => {
    setErrorMessage('');
    setUserText(value);
    if (value) {
      const sentencesArray = value
        .replaceAll('__', '[MASK]')
        .trim()
        .match(sentenceRegex)
        .map((i) => {
          return i.trim();
        });
      setStartingSentences(sentencesArray);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (checkSubmittedText(userText)) {
      processWithBert();
    }
    setLoading(false);
    return;
  };

  const handleReset = () => {
    setLoading(false);
    setUserText('');
    setStartingSentences([]);
    setCompletedSentences([]);
    setBertResponse('');
    setErrorMessage('');
  };

  return (
    <Container mt='5vh' bg='#FFF' borderRadius='10px' p='20px' maxHeight='80vh'>
      <FormControl id='email' isInvalid={errorMessage}>
        <FormLabel>
          <Heading as='h2' size='lg'>
            Play Mad Libs with BERT
          </Heading>
        </FormLabel>
        <FormHelperText mb='15px'>
          <b>Use a __ (double underscore) for blank spaces.</b>
          <br />
          <br />
          This proof-of-concept uses a DistilBERT model focused on Masked
          Language Modeling to predict masked words in a series of sentences. In
          this case, we're manually providing the mask location with a double
          underscore. While Mad Libs certainly aren't the intended purpose of
          this model, it's still fun to play with!
          <br />
          <br />
          Try to copy the paragraph above and replace a few words with __ .
        </FormHelperText>
        <Textarea
          fontSize='12px'
          variant='filled'
          focusBorderColor='blue.300'
          placeholder='Construct your Mad Lib here...'
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
