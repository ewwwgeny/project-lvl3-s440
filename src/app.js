import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import isURL from 'validator/lib/isURL';
import axios from 'axios';
import { watch } from 'melanke-watchjs';
import $ from 'jquery';
import parse from './rssParser';
import { renderChannels, renderArticles } from './rssDataRenderers';

export default () => {
  const state = {
    addedUrls: [],
    inputStatus: 'init', // invalid, duplicate, valid, loading, error
    loadingError: null,
    feeds: {
      channels: [],
      articles: [],
    },
    modalContent: {
      title: '',
      content: '',
    },
  };

  const corsProxy = 'https://cors-anywhere.herokuapp.com/';

  const urlInput = document.getElementById('urlInputForm');
  const addFeedBtn = document.getElementById('addFeedBtn');
  const form = document.querySelector('form');
  const statusMessageElem = document.getElementById('statusMessage');

  const findArticle = articleTitle => state.feeds.articles
    .find(({ title }) => title === articleTitle);

  // urlInput.value = '';
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

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const newURL = urlInput.value;
    const urlWithCORS = `${corsProxy}${newURL}`;

    state.loadingError = null;
    state.inputStatus = 'loading';

    axios.get(urlWithCORS).then((response) => {
      const { title, description, items } = parse(response.data);

      state.addedUrls.push(newURL);
      state.feeds.channels.push({ title, description });
      state.feeds.articles.push(...items);

      state.inputStatus = 'init';
    }).catch((error) => {
      state.loadingError = error.message;
    });
  });

  $('#modalWindow').on('hide.bs.modal', () => {
    state.modalContent = { title: '', content: '' };
  });

  const updateArticles = () => {
    const promises = state.addedUrls.map(url => axios.get(`${corsProxy}${url}`));
    setTimeout(() => Promise.all(promises).then((responses) => {
      const newArticles = responses
        .map(response => parse(response.data).items
          .filter(({ title }) => !findArticle(title)))
        .flat();
      state.feeds.articles.push(...newArticles);
    }).finally(updateArticles), 5000);
  };

  updateArticles();

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
    error: () => {
      urlInput.classList.add('is-invalid');
      urlInput.classList.remove('is-valid');
      addFeedBtn.setAttribute('disabled', '');
      statusMessageElem.textContent = state.loadingError;
    },
  };

  watch(state, 'inputStatus', () => {
    renderInputMethods[state.inputStatus]();
  });

  watch(state, 'loadingError', () => {
    if (state.loadingError !== null) {
      state.inputStatus = 'error';
    }
  });

  watch(state, 'feeds', () => {
    renderChannels(state.feeds.channels);
    renderArticles(state.feeds.articles);
    $('.btn-outline-info').on('click', (e) => {
      const title = $(e.target).prev('a').text();
      const content = findArticle(title).description;
      state.modalContent = { title, content };
    });
  });

  watch(state, 'modalContent', () => {
    const { title, content } = state.modalContent;
    $('#modalLabel').text(title);
    $('#modalBody').html(content);
  });
};
