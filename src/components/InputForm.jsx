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

const occurrences = (string, subString, allowOverlapping) => {
  string += '';
  subString += '';
  if (subString.length <= 0) return string.length + 1;

  var n = 0,
    pos = 0,
    step = allowOverlapping ? 1 : subString.length;

  while (true) {
    pos = string.indexOf(subString, pos);
    if (pos >= 0) {
      ++n;
      pos += step;
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
      if (occurrences(i, '[MASK]') > 1) {
        setErrorMessage('Only one [MASK] allowed per sentence.');
        return;
      }
    });
  }, [sentences]);

  const checkSubmittedText = (value) => {
    // Set default return value
    let valuePassed = true;

    // Check if we got any text from the user
    if (!value) {
      setErrorMessage('Please provide some text.');
      valuePassed = false;
      return valuePassed;
    }

    if (!value.includes('[MASK]')) {
      setErrorMessage(
        'Please provide at least one [MASK] for BERT to fill in.'
      );
      valuePassed = false;
      return valuePassed;
    }

    return valuePassed;

    // Break apart the paragraph into an array of sentences

    // Check that at least one sentence has a [MASK] and that no sentence has >1 [MASK]

    // return true/false based on these checks passing

    //  Check if value is defined
    /* if (value) {
      // Run reach individual check
      if (value.length > 0) {
        lengthCheck = true;
      } else {
        setErrorMessage('Please provide some text.');
      }
      if (value.includes('[MASK]')) {
        maskCheck = true;
      }
      const regex = /[^.!?]+[.!?]+["']?|.+$/g;

      const sentencesArray = value
        .trim()
        .match(regex)
        .map((i) => {
          return i.trim();
        });

      sentencesArray.forEach((i) => {
        if (occurrences(i, '[MASK]') > 1) {
          oneMaskPerSentence = false;
          return;
        }
      }); 
    }

    // if all checks defined above are true, return true
    if (lengthCheck && maskCheck && oneMaskPerSentence) {
      return true;
    } else {
      return false;
    } */
  };

  const handleChange = (value) => {
    console.log('value typed:', value);
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
      console.log('apiKey', apiKey);
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

  const handleReset = () => {
    setLoading(false);
    setUserText('');
    setSentences([]);
    setBertResponse('');
    setErrorMessage('');
  };

  return (
    <Container mt='5%'>
      <FormControl id='email' isInvalid={errorMessage}>
        <FormLabel>
          <Heading size='md'>Play Mad Libs with BERT...</Heading>
        </FormLabel>
        <Textarea
          placeholder='Write sentences with at least one value for BERT to fill in...'
          value={userText}
          onChange={(e) => {
            handleChange(e.target.value);
          }}
        />
        <FormErrorMessage>{errorMessage}</FormErrorMessage>
        <FormHelperText mb='10px'>
          Make sure to leave at least one <b>[MASK]</b> for BERT to fill in.
        </FormHelperText>
        <Button
          isLoading={loading}
          isDisabled={errorMessage}
          colorScheme='teal'
          variant='solid'
          size='sm'
          onClick={handleSubmit}
        >
          Submit to BERT
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
      <Divider my='20px' />
      <Text mt='5px'>{bertResponse}</Text>
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
        team for the BERT model and API.
      </Text>
    </Container>
  );
};

export default InputForm;
