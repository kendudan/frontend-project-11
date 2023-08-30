export default (loadedData) => {
  if (!loadedData) {
    throw new Error('Network Error');
  }
  const xml = loadedData.data.contents;
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(xml, 'application/xml');
  const parsedError = parsedData.querySelector('parsererror');
  if (parsedError) {
    throw new Error('Parsing Error');
  }

  const feed = {
    title: parsedData.querySelector('channel title').textContent,
    description: parsedData.querySelector('channel description').textContent,
  };

  const posts = Array.from(parsedData.querySelectorAll('item'))
    .map((item) => (
      {
        title: item.querySelector('title').textContent,
        link: item.querySelector('link').textContent,
        description: item.querySelector('description').textContent,
      }
    ));

  return [feed, posts];
};
