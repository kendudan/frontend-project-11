import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import i18next from 'i18next';
import _ from 'lodash';
import onChange from 'on-change';
import loadData from './utils/loadData';
import { renderFeedback, renderFeedsAndPosts, renderModal } from './view';
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
    channels: [],
    feedback: '',
    processState: 'filling',
  },
  parsedData: {
    feeds: [],
    posts: [],
  },
  viewedPosts: new Set(),
};

const form = document.querySelector('form.rss-form.text-body');
const input = document.getElementById('url-input');
const submitButton = document.querySelector('button[type="submit"]');
const postsContainer = document.querySelector('.posts');

yup.setLocale({
  mixed: {
    notOneOf: () => ({ key: 'feedback.invalid.alreadyExist' }),
    required: () => ({ key: 'feedback.invalid.notEmpty' }),
  },
  string: {
    url: () => ({ key: 'feedback.invalid.invalidURL' }),
  },
});

let shema = yup.string().url().required().notOneOf(state.rssForm.channels);

const handleProcessState = (element, processState) => {
  switch (processState) {
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

const watchedState = onChange(state, (path, value) => {
  switch (path) {
    case 'rssForm.feedback':
      renderFeedback(input, state.rssForm.valid, value, i18nInstance);
      break;
    case 'rssForm.channels':
      shema = yup.string().url().required().notOneOf(state.rssForm.channels);
      break;
    case 'parsedData.posts':
    case 'viewedPosts':
      renderFeedsAndPosts(state, i18nInstance);
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
      const newPosts = posts.map((post) => ({ ...post, id: _.uniqueId(), feedId: feed.id }));
      if (_.isEmpty(feed) && newPosts.length === 0) {
        watchedState.rssForm.valid = false;
      } else if (!_.isEmpty(feed) && newPosts.length !== 0) {
        watchedState.rssForm.valid = true;
        watchedState.rssForm.feedback = { key: 'feedback.loaded' };
        watchedState.parsedData.feeds = [feed, ...watchedState.parsedData.feeds];
        watchedState.parsedData.posts = [...newPosts, ...watchedState.parsedData.posts];
      }
      watchedState.rssForm.channels.push(state.rssForm.value);
      watchedState.rssForm.processState = 'filling';
    })
    .catch((error) => {
      watchedState.rssForm.valid = false;
      watchedState.rssForm.processState = 'error';
      if (error.message === 'Parsing Error') {
        watchedState.rssForm.feedback = { key: 'feedback.notValidRSS' };
      } else {
        watchedState.rssForm.feedback = { key: 'feedback.networkError' };
      }
    });
};

const updateData = (channels) => {
  const promises = channels.map((channel) => loadData(channel)
    .then((response) => {
      const [feed, posts] = parseData(response);
      const feedForUpdate = state.parsedData.feeds.find((element) => element.title === feed.title);
      const loadedPosts = state.parsedData.posts.filter((post) => post.feedId === feedForUpdate.id);
      const newPosts = _.differenceBy(posts, loadedPosts, 'link');
      if (newPosts.length !== 0) {
        const NeP = newPosts.map((post) => ({ ...post, id: _.uniqueId, feedId: feedForUpdate.id }));
        watchedState.parsedData.posts = [...NeP, ...watchedState.parsedData.posts];
      }
    })
    .catch(console.error));
  Promise.all(promises).finally(() => setTimeout(() => updateData(state.rssForm.channels), 5000));
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
      const [error] = err.errors;
      watchedState.rssForm.feedback = error;
    });

  setTimeout(() => updateData(state.rssForm.channels), 5000);
};

form.addEventListener('submit', handleSubmit);

const handleClick = (e) => {
  e.preventDefault();
  const { id } = e.target.dataset;
  if (e.target.closest('button')) {
    renderModal(state.parsedData.posts, id, i18nInstance);
  }
  watchedState.viewedPosts.add(id);
};

postsContainer.addEventListener('click', handleClick);
