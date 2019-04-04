export default (xml) => {
  const dom = new DOMParser().parseFromString(xml, 'application/xml');
  if (!dom.querySelector('rss')) {
    throw new Error('Error reading RSS data from this source!');
  }
  const channel = dom.querySelector('channel');
  const items = [...channel.querySelectorAll('item')].map(item => (
    {
      title: item.querySelector('title').textContent,
      link: item.querySelector('link').textContent,
      description: item.querySelector('description').textContent,
      pubDate: Date.parse(item.querySelector('pubDate').textContent),
    }
  ));
  return {
    title: channel.querySelector('title').textContent,
    description: channel.querySelector('description').textContent,
    items,
  };
};
