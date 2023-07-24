import  './styles.scss';
import  'bootstrap';

const render = (element, value, feedback, i18n) => {
    const parent = document.getElementById('parent');

    if (value === true) {
        element.classList.remove('is-invalid');

        if (document.getElementById('negative') !== null) {
            document.getElementById('negative').remove();
        }
        
        const positiveFeedback = document.createElement('p');
        positiveFeedback.textContent = i18n.t(feedback.key);
        positiveFeedback.className = 'feedback m-0 position-absolute small text-success';
        positiveFeedback.setAttribute('id', 'positive');
        parent.append(positiveFeedback);
    } else {
        element.classList.add('is-invalid');

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

export default render;