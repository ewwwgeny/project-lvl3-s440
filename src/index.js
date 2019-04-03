import 'bootstrap/dist/css/bootstrap.min.css';
import isURL from 'validator/lib/isURL';
// import _ from 'lodash';
import axios from 'axios';
import { watch } from 'melanke-watchjs';
import parse from './rssParser';
import { renderChannels, renderArticles } from './rssDataRenderers';

const app = () => {
  const state = {
    addedUrls: ['http://ya.ru'],
    inputStatus: 'init', // invalid, duplicate, loading, valid
    loadingError: null,
    feeds: {
      channels: [],
      articles: [],
    },
  };

  const corsProxy = 'https://cors-anywhere.herokuapp.com/';

  const urlInput = document.getElementById('urlInputForm');
  urlInput.value = '';
  urlInput.addEventListener('input', ({ target: { value } }) => {
    if (value.length === 0) {
      state.inputStatus = 'init';
      return;
    }
    const isValidInput = isURL(value);
    const urlInFeeds = isValidInput && state.addedUrls.includes(value);
    if (!isValidInput) {
      state.inputStatus = 'invalid';
      return;
    }
    if (urlInFeeds) {
      state.inputStatus = 'duplicate';
      return;
    }
    if (isValidInput && !urlInFeeds) {
      state.inputStatus = 'valid';
    }
  });

  const addFeedBtn = document.getElementById('addFeedBtn');
  addFeedBtn.addEventListener('click', () => {
    const newURL = urlInput.value;
    const urlWithCORS = `${corsProxy}${newURL}`;

    state.loadingError = null;
    state.inputStatus = 'loading';

    axios.get(urlWithCORS).then((response) => {
      const { title, description, items } = parse(response.data);
      state.addedUrls.push(newURL);
      state.feeds.channels.push({ title, description });
      state.feeds.articles.push(...items);

      console.log(state);
      state.inputStatus = 'init';
    }).catch((error) => {
      state.inputStatus = 'init';
      state.loadingError = error.message;
    });
  });

  const form = document.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });

  const statusMessageElem = document.getElementById('statusMessage');

  const renderInputMethods = {
    init: () => {
      urlInput.value = '';
      urlInput.classList.remove('is-valid');
      urlInput.classList.remove('is-invalid');
      addFeedBtn.setAttribute('disabled', '');
      statusMessageElem.textContent = '';
    },
    invalid: () => {
      urlInput.classList.add('is-invalid');
      urlInput.classList.remove('is-valid');
      addFeedBtn.setAttribute('disabled', '');
      statusMessageElem.textContent = 'Invalid URL!';
    },
    duplicate: () => {
      urlInput.classList.add('is-invalid');
      urlInput.classList.remove('is-valid');
      addFeedBtn.setAttribute('disabled', '');
      statusMessageElem.textContent = 'This URL has already been added!';
    },
    loading: () => {
      urlInput.classList.add('is-valid');
      urlInput.classList.remove('is-invalid');
      addFeedBtn.setAttribute('disabled', '');
      statusMessageElem.textContent = 'Loading, please wait...';
    },
    valid: () => {
      urlInput.classList.add('is-valid');
      urlInput.classList.remove('is-invalid');
      addFeedBtn.removeAttribute('disabled', '');
      statusMessageElem.textContent = '';
    },
  };

  watch(state, 'inputStatus', () => {
    renderInputMethods[state.inputStatus]();
  });

  watch(state, 'loadingError', () => {
    if (state.loadingError !== null) {
      console.log('error');
      statusMessageElem.textContent = state.loadingError;
    }
  });

  watch(state, 'feeds', () => {
    renderChannels(state.feeds.channels);
    renderArticles(state.feeds.articles);
  });
};

app();
