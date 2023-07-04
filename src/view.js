import  './styles.scss';
import  'bootstrap';



const render = (element, value) => {
    if (value === true) {
        element.classList.remove('is-invalid');
    } else {
        element.classList.add('is-invalid');
    }

}



export default render;