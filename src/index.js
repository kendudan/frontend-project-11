import  './styles.scss';
import  'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import render from './view';

const state = {
    rssForm: {
        value: '',
        valid: null,
        values: [],
        error: '',
    }
};

const form = document.querySelector('form.rss-form.text-body');
const input = document.getElementById('url-input');

let shema = yup.string().url('Ссылка должна быть валидным URL').required().notOneOf(state.rssForm.values, 'RSS уже существует');

const watchedState = onChange(state, (path, value) => {
    const error = state.rssForm.error;
    const err = error.toString();
    switch (path) {
        case 'rssForm.valid':
          render(input, value, err);
          break;
        case 'rssForm.error':
          render(input, false, value);
          break;
        case 'rssForm.values':
          shema = yup.string().url('Ссылка должна быть валидным URL').required().notOneOf(state.rssForm.values, 'RSS уже существует');
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
        e.target.reset();
        input.focus();
    })
    .catch((err) => {
        watchedState.rssForm.valid = false;
        watchedState.rssForm.error = err.errors;
    });
};

form.addEventListener('submit', handleSubmit);

