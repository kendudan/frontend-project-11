import  './styles.scss';
import  'bootstrap';
import * as yup from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import render from './view';
import resources from './locales/index';
import renderTexts from './renderTexts';
import elements from './elements';

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
    }
};

const form = document.querySelector('form.rss-form.text-body');
const input = document.getElementById('url-input');

yup.setLocale({
    mixed: {
        notOneOf: () => ({ key: 'feedback.invalid.alreadyExist' }),
    },
    string: {
        url: () => ({ key: 'feedback.invalid.invalidURL' }),
    },
});

let shema = yup.string().url().required().notOneOf(state.rssForm.values);

const watchedState = onChange(state, (path, value) => {
    const valid = state.rssForm.valid;
    switch (path) {
        case 'rssForm.feedback':
          render(input, valid, value, i18nInstance);
          break;
        case 'rssForm.values':
          shema = yup.string().url().required().notOneOf(state.rssForm.values);
        default:
          break;
      }
});



const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    state.rssForm.value = formData.get('url');
    shema
    .validate(state.rssForm.value)
    .then(() => {
        watchedState.rssForm.valid = true;
        watchedState.rssForm.values.push(state.rssForm.value);
        watchedState.rssForm.feedback = { key: 'feedback.valid' };
        e.target.reset();
        input.focus();
    })
    .catch((err) => {
        watchedState.rssForm.valid = false;
        watchedState.rssForm.feedback = err.errors[0];
    });
};

form.addEventListener('submit', handleSubmit);

