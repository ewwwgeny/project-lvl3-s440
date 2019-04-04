export const renderChannels = (channels) => {
  const channelList = document.getElementById('channelList');
  const innerHTML = channels.map(({ title, description }) => (
    `<div class="list-group-item">
      <h5>${title}</h5>
      <p>${description}</p>
    </div>`)).join('');
  channelList.innerHTML = innerHTML;
  const header = document.createElement('h4');
  header.classList.add('ml-4');
  header.textContent = 'Channels:';
  channelList.prepend(header);
};

export const renderArticles = (articles) => {
  const articleList = document.getElementById('articleList');
  const innerHTML = articles.map(({ title, link }) => (
    `<div class="list-group-item">
      <a href="${link}">${title}</a>
      <button type="button" class="btn btn-sm btn-outline-info ml-sm-2" data-toggle="modal" data-target="#modalWindow">
        Viev info
      </button>
    </div>`)).join('');
  articleList.innerHTML = innerHTML;
  const header = document.createElement('h4');
  header.classList.add('ml-4');
  header.textContent = 'Articles:';
  articleList.prepend(header);
};
