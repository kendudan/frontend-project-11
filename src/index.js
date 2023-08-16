import  './styles.scss';
import  'bootstrap';
import * as yup from 'yup';
import i18next from 'i18next';
import _ from 'lodash';
import onChange from 'on-change';
import loadData from './utils/loadData';
import { renderFeedback, renderFeedsAndPosts } from './view';
import resources from './locales/index';
import renderTexts from './utils/renderTexts';
import elements from './elements';
import parseData from './utils/parser';

const i18nInstance = i18next.createInstance();

i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
});

renderTexts(i18nInstance, elements);

const state = {
    rssForm: {
        value: '',
        valid: null,
        values: [],
        feedback: '',
        processState: 'filling',
    },
    parsedData: {
        feeds: [],
        posts: [],
    },
    
};

const form = document.querySelector('form.rss-form.text-body');
const input = document.getElementById('url-input');
const submitButton = document.querySelector('button[type="submit"]');

yup.setLocale({
    mixed: {
        notOneOf: () => ({ key: 'feedback.invalid.alreadyExist' }),
    },
    string: {
        url: () => ({ key: 'feedback.invalid.invalidURL' }),
    },
});

let shema = yup.string().url().required().notOneOf(state.rssForm.values);

const watchedState = onChange(state, (path, value, prevValue) => {
    const valid = state.rssForm.valid;
    switch (path) {
        case 'rssForm.feedback':
          renderFeedback(input, valid, value, i18nInstance);
          break;
        case 'rssForm.values':
          shema = yup.string().url().required().notOneOf(state.rssForm.values);
          break;
        case 'parsedData.posts':
          renderFeedsAndPosts(state);
          break;
        case 'rssForm.processState':
          handleProcessState(submitButton, value);
          break;
        default:
          break;
      }
});

const prepareData = (url) => {
    loadData(url)
    .then((response) => {
        const [feed, posts] = parseData(response);
        feed.id = _.uniqueId();
        posts.map((post) => {
            post.id = _.uniqueId();
            post.feedId = feed.id;
        });
        
        if (_.isEmpty(feed) && posts.length === 0) {
            watchedState.rssForm.valid = false;
        } else if (!_.isEmpty(feed) && posts.length !== 0) {
            console.log('in');
            watchedState.rssForm.valid = true;
            watchedState.rssForm.processState = 'sent';
            watchedState.parsedData.feeds = [feed, ...watchedState.parsedData.feeds];
            watchedState.parsedData.posts = [...posts, ...watchedState.parsedData.posts];
        }
        watchedState.rssForm.values.push(state.rssForm.value);
        watchedState.rssForm.processState = 'filling';
    })
    .catch(() => {
        watchedState.rssForm.valid = false;
        watchedState.rssForm.processState = 'error';
        watchedState.rssForm.feedback = { key: 'feedback.networkError' };
      })
    
}

const handleProcessState = (element, processState) => {
    switch (processState) {
      case 'sent':
        watchedState.rssForm.feedback = { key: 'feedback.loaded' };
        break;
  
      case 'error':
        element.disabled = false;
        break;
  
      case 'sending':
        element.disabled = true;
        break;
  
      case 'filling':
        element.disabled = false;
        break;
  
      default:
        throw new Error(`Unknown process state: ${processState}`);
    }
  };

const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    state.rssForm.value = formData.get('url');
    shema
    .validate(state.rssForm.value)
    .then((rss) => {
        watchedState.rssForm.processState = 'sending';
        watchedState.rssForm.feedback = { key: 'feedback.loading' };
        e.target.reset();
        input.focus();
        prepareData(rss);
    })
    .catch((err) => {
        watchedState.rssForm.valid = false;
        watchedState.rssForm.processState = 'error';
        console.log(err);
        watchedState.rssForm.feedback = err.errors[0];
    });
};

form.addEventListener('submit', handleSubmit);

