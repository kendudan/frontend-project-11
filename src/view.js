import  './styles.scss';
import  'bootstrap';

const renderFeedback = (element, value, feedback, i18n) => {
    const parent = document.getElementById('parent');

    if (value === true || feedback.key === 'feedback.loading') {
        element.classList.remove('is-invalid');

        if (document.getElementById('negative') !== null) {
            document.getElementById('negative').remove();
        } else if (document.getElementById('positive') !== null) {
            document.getElementById('positive').remove();
        }
        
        const positiveFeedback = document.createElement('p');
        positiveFeedback.textContent = i18n.t(feedback.key);
        positiveFeedback.className = 'feedback m-0 position-absolute small text-success';
        positiveFeedback.setAttribute('id', 'positive');
        parent.append(positiveFeedback);
    } else {
        if (feedback.key !== 'feedback.networkError') {
            element.classList.add('is-invalid');
        }

        if (document.getElementById('positive') !== null) {
            document.getElementById('positive').remove();
        } else if (document.getElementById('negative') !== null) {
            document.getElementById('negative').remove();
        }
    
        const negativeFeedback = document.createElement('p');
        negativeFeedback.textContent = i18n.t(feedback.key);
        negativeFeedback.className = 'feedback m-0 position-absolute small text-success text-danger';
        negativeFeedback.setAttribute('id', 'negative');
        parent.append(negativeFeedback);
        
    }
};

const renderFeedsAndPosts = (state, i18n) => {
    const feedsContainer = document.querySelector('.feeds');
    feedsContainer.innerHTML = '';
    if (state.parsedData.feeds.length === 0 && state.parsedData.posts.length === 0) {
        console.log('tyt');
        const loadingContainer = document.createElement('div');
        feedsContainer.append(loadingContainer);
        const loading = document.createElement('p');
        loading.textContent = 'Загрузка';
        loadingContainer.append(loading);
    }
    const card = document.createElement('div');
    card.classList.add('card-body');
    const feedsHeader = document.createElement('h2');
    feedsHeader.classList.add('card-title', 'h4');
    feedsHeader.textContent = "Фиды";
    card.append(feedsHeader);
    const feedsList = document.createElement('ul');
    feedsList.classList.add('list-group', 'border-0', 'rounded-0');
    feedsContainer.append(card, feedsList);
    const feedElement = document.createElement('li');
    feedElement.classList.add('list-group-item', 'border-0', 'border-end-0');
    feedsList.append(feedElement);
    state.parsedData.feeds.forEach((feed) => {
        const feedName = document.createElement('h3');
        feedName.classList.add('h6', 'm-0');
        feedName.textContent = feed.title;
        const feedDescription = document.createElement('p');
        feedDescription.classList.add('m-0', 'small', 'text-black-50');
        feedDescription.textContent = feed.description;
        feedElement.append(feedName, feedDescription);
    });
    const postsContainer = document.querySelector('.posts');
    postsContainer.innerHTML = '';
    const postCard = document.createElement('div');
    postCard.classList.add('card-body');
    const postsHeader = document.createElement('h2');
    postsHeader.classList.add('card-title', 'h4');
    postsHeader.textContent = "Посты";
    postCard.append(postsHeader);
    const postsList = document.createElement('ul');
    postsList.classList.add('list-group', 'border-0', 'rounded-0');
    postsContainer.append(postCard, postsList);
    state.parsedData.posts.forEach((post) => {
        const postElement = document.createElement('li');
        postElement.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
        const postName = document.createElement('a');
        const classForPostName = state.viewedPosts.has(post.id) ? 'fw-normal' : 'fw-bold';
        postName.classList.add(classForPostName);
        postName.setAttribute('href', post.link);
        postName.dataset.id = post.id;
        postName.setAttribute('target', '_blank');
        postName.setAttribute('rel', 'noopener noreferrer');
        postName.textContent = post.title;
        postElement.append(postName);
        const postButton = document.createElement('button');
        postButton.setAttribute('type', 'button');
        postButton.classList.add('btn', 'btn-outline-primary');
        postButton.dataset.bsToggle = 'modal';
        postButton.dataset.bsTarget = '#modal';
        //console.log(i18n.t('watchButton'));
        postButton.textContent = i18n.t('watchButton');
        //console.log(postButton.textContent);
        postButton.dataset.id = post.id;
        postElement.append(postButton);

        postsList.append(postElement);
    });
};

const renderModal = (posts, id, i18n) => {
    const post = posts.find((item) => item.id === id);
    const modalTitle = document.getElementById('modalLabel');
        modalTitle.textContent = post.title;
        const modalBody = document.querySelector('.modal-body');
        modalBody.textContent = post.description;
        const buttonReadMore = document.getElementById('readMore');
        buttonReadMore.setAttribute('href', post.link);
        buttonReadMore.textContent = i18n.t('modalButtons.readMore');
        const buttonClose = document.getElementById('close');
        buttonClose.textContent = i18n.t('modalButtons.close');
};

export { renderFeedback, renderFeedsAndPosts, renderModal };