import  './styles.scss';
import  'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import render from './view';

const state = {
    rssForm: {
        value: '',
        valid: null,
        errors: [],
    }
};

const form = document.querySelector('form.rss-form.text-body');
const input = document.getElementById('url-input');

const watchedState = onChange(state, (path, value) => {
    switch (path) {
        case 'rssForm.valid':
          render(input, value);
          break;
        default:
          break;
      }
});

const shema = yup.string().url('Ссылка должна быть валидным URL').required();

const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    state.rssForm.value = formData.get('url');
    shema
    .validate(state.rssForm.value)
    .then(() => {
        watchedState.rssForm.valid = true;
        console.log(state.rssForm.valid);
    })
    .catch((err) => {
        console.log(err.name);
        console.log(err.errors);
        watchedState.rssForm.valid = false;
        console.log(state.rssForm.valid);
    });
};

form.addEventListener('submit', handleSubmit);

